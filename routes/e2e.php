<?php

/*
|--------------------------------------------------------------------------
| End-to-end test helper routes
|--------------------------------------------------------------------------
|
| Loaded by App\Providers\E2EServiceProvider only when APP_ENV=e2e. They let the
| Playwright suite in tests/e2e reset the database, log in as a seeded persona,
| read sent mails, freeze the clock and run scheduled commands.
|
*/

use App\Models\Protocol;
use App\Models\User;
use App\Providers\E2EServiceProvider;
use Carbon\Carbon;
use Database\Seeders\E2ESeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
 * Restores the seeded state. The first call (or ?fresh=1, or a changed migration set)
 * migrates and seeds, then keeps a JSON snapshot of every table. Later calls truncate
 * and refill the tables from that snapshot, which takes a fraction of a second.
 */
Route::post('reset', function (Request $request) {
	$snapshotFile = E2EServiceProvider::storagePath('snapshot.json');
	$migrationsHash = md5(implode(',', array_map('basename', glob(database_path('migrations/*.php')))) . filemtime(database_path('seeders/E2ESeeder.php')));
	$snapshot = file_exists($snapshotFile) ? json_decode(file_get_contents($snapshotFile), true) : null;

	if ($request->boolean('fresh') || !$snapshot || $snapshot['hash'] !== $migrationsHash) {
		Artisan::call('migrate:fresh', ['--force' => true]);
		Artisan::call('db:seed', ['--class' => E2ESeeder::class, '--force' => true]);

		$tables = [];
		foreach (DB::select('SHOW TABLES') as $row) {
			$table = array_values((array) $row)[0];
			if ($table !== 'migrations') {
				$tables[$table] = DB::table($table)->get()->map(function ($r) {
					return (array) $r;
				})->all();
			}
		}
		file_put_contents($snapshotFile, json_encode(['hash' => $migrationsHash, 'tables' => $tables]));
	} else {
		DB::statement('SET FOREIGN_KEY_CHECKS=0');
		foreach ($snapshot['tables'] as $table => $rows) {
			DB::table($table)->truncate();
			foreach (array_chunk($rows, 200) as $chunk) {
				DB::table($table)->insert($chunk);
			}
		}
		DB::statement('SET FOREIGN_KEY_CHECKS=1');
	}

	@unlink(E2EServiceProvider::storagePath('mails.jsonl'));
	@unlink(E2EServiceProvider::storagePath('now.txt'));
	// Rate limiter counters live in the cache; tests run far more requests per minute than people do.
	Cache::flush();
	Auth::logout();
	$request->session()->invalidate();

	return response()->json(['success' => true]);
});

Route::post('login', function (Request $request) {
	$user = User::where('email', $request->input('email'))->firstOrFail();
	Auth::login($user);
	$request->session()->regenerate();

	return response()->json(['success' => true, 'user_id' => $user->id]);
});

Route::post('logout', function (Request $request) {
	Auth::logout();
	$request->session()->invalidate();

	return response()->json(['success' => true]);
});

Route::get('mails', function () {
	$file = E2EServiceProvider::storagePath('mails.jsonl');
	$lines = file_exists($file) ? array_filter(explode("\n", file_get_contents($file))) : [];

	return response()->json(array_map(function ($line) {
		return json_decode($line, true);
	}, array_values($lines)));
});

Route::delete('mails', function () {
	@unlink(E2EServiceProvider::storagePath('mails.jsonl'));

	return response()->json(['success' => true]);
});

Route::post('time', function (Request $request) {
	$file = E2EServiceProvider::storagePath('now.txt');
	if ($request->filled('now')) {
		file_put_contents($file, Carbon::parse($request->input('now'))->toIso8601String());
	} else {
		@unlink($file);
	}

	return response()->json(['success' => true]);
});

Route::post('artisan', function (Request $request) {
	$command = $request->input('command');
	abort_unless(in_array($command, ['embargo:check', 'enddate:reminder'], true), 422, 'command_not_allowed');
	Artisan::call($command);

	return response()->json(['success' => true, 'output' => Artisan::output()]);
});

/*
 * Read-only lookups so tests can find seeded records and assert state the UI does not show.
 */
Route::get('protocol', function (Request $request) {
	$protocol = Protocol::with('details', 'embargoEndDates', 'embargoExtensions', 'revisions', 'adminActions')
		->get()
		->first(function (Protocol $p) use ($request) {
			return $p->title === $request->input('title');
		});
	abort_unless($protocol, 404);

	return response()->json([
		'id' => $protocol->id,
		'pct_id' => $protocol->pct_id,
		'status' => $protocol->status,
		'user_id' => $protocol->user_id,
		'has_embargo' => $protocol->has_embargo,
		'embargo_end_date' => $protocol->embargo_end_date,
		'embargo_extensions' => $protocol->embargoExtensions,
		'revisions' => $protocol->revisions,
		'admin_actions' => $protocol->adminActions,
		'linked' => $protocol->linked->pluck('id')->values(),
		'details' => $protocol->details->mapWithKeys(function ($d) {
			return [$d->key => $d->value];
		}),
	]);
});

Route::get('user', function (Request $request) {
	$user = User::where('email', $request->input('email'))->firstOrFail();

	return response()->json($user->makeVisible('password')->only(['id', 'first_name', 'last_name', 'email', 'email_verified_at', 'institution', 'city', 'country', 'role']));
});
