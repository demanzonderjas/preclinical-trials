<?php

namespace App\Providers;

use Carbon\Carbon;
use Dotenv\Dotenv;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * Test support for the end-to-end suite in tests/e2e.
 *
 * Only active when APP_ENV=e2e (see .env.e2e). It points the app at its own MySQL
 * database (same server and credentials as the normal .env), records every sent mail to
 * storage/app/e2e/mails.jsonl, lets tests freeze the clock, and registers the /__e2e
 * helper routes from routes/e2e.php.
 */
class E2EServiceProvider extends ServiceProvider
{
	public static function storagePath(string $file = ''): string
	{
		return storage_path('app/e2e' . ($file ? '/' . $file : ''));
	}

	public function register()
	{
		if (!$this->isActive()) {
			return;
		}

		$overrides = [
			'database.default' => 'mysql',
			'mail.default' => 'array',
			'queue.default' => 'sync',
		];

		// Reuse the developer's MySQL connection details; .env.e2e only names the database.
		$devEnv = base_path('.env');
		if (file_exists($devEnv)) {
			$values = Dotenv::parse(file_get_contents($devEnv));
			foreach (['host' => 'DB_HOST', 'port' => 'DB_PORT', 'username' => 'DB_USERNAME', 'password' => 'DB_PASSWORD'] as $key => $name) {
				if (array_key_exists($name, $values)) {
					$overrides["database.connections.mysql.$key"] = $values[$name];
				}
			}
		}

		config($overrides);
	}

	public function boot()
	{
		if (!$this->isActive()) {
			return;
		}

		if (!is_dir(self::storagePath())) {
			mkdir(self::storagePath(), 0755, true);
		}

		$now = self::storagePath('now.txt');
		if (file_exists($now)) {
			Carbon::setTestNow(Carbon::parse(trim(file_get_contents($now))));
		}

		Event::listen(MessageSent::class, function (MessageSent $event) {
			file_put_contents(
				self::storagePath('mails.jsonl'),
				json_encode(self::describeMail($event->message)) . "\n",
				FILE_APPEND | LOCK_EX
			);
		});

		Route::middleware('web')->prefix('__e2e')->group(base_path('routes/e2e.php'));
	}

	/**
	 * Works with both SwiftMailer (Laravel 8) and Symfony Mailer (Laravel 9+) messages.
	 */
	public static function describeMail($message): array
	{
		$to = [];
		foreach ((array) $message->getTo() as $key => $value) {
			$to[] = is_object($value) && method_exists($value, 'getAddress') ? $value->getAddress() : $key;
		}

		$html = method_exists($message, 'getHtmlBody') ? $message->getHtmlBody() : $message->getBody();
		$text = method_exists($message, 'getTextBody') ? $message->getTextBody() : null;

		return [
			'to' => $to,
			'subject' => $message->getSubject(),
			'html' => (string) $html,
			'text' => $text ?? trim(strip_tags((string) $html)),
			'sent_at' => Carbon::now()->toIso8601String(),
		];
	}

	private function isActive(): bool
	{
		return $this->app->environment('e2e') && !$this->app->isProduction();
	}
}
