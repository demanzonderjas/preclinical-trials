<?php

use App\Http\Controllers\Pages\AboutController;
use App\Http\Controllers\Pages\ContactController;
use App\Http\Controllers\Pages\ContentPageController;
use App\Http\Controllers\Pages\DatabaseController;
use App\Http\Controllers\Pages\HelpController;
use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\NewsController;
use App\Http\Controllers\Pages\ProtocolPageController;
use App\Http\Controllers\Pages\ProtocolPdfController;
use App\Http\Controllers\Pages\Workspace\DashboardController;
use App\Http\Controllers\Pages\Workspace\MyProtocolsController;
use App\Http\Controllers\Pages\Workspace\ProtocolFormController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Every page is rendered by the React SPA in resources/views/index.blade.php;
| these routes only decide who may load which part of it.
|
*/

// The A2 design system on one page. Outside production, or for admins.
Route::get('/design-system', function (Request $request) {
    abort_unless(! app()->isProduction() || $request->user()?->is_admin, 404);

    return Inertia::render('design-system', [
        'layout' => in_array($request->query('layout'), ['public', 'auth', 'workspace', 'admin'], true) ? $request->query('layout') : 'public',
    ]);
})->name('design-system');

Route::get('/', HomeController::class)->name('index');

Route::get('/database', [DatabaseController::class, 'index'])->name('database');
Route::get('/database/export.csv', [DatabaseController::class, 'export'])->middleware(['auth', 'verified'])->name('database.export');

Route::get('/about-pct', AboutController::class)->name('about');
// The legacy about sub-pages are sections of the A2 About page now.
Route::permanentRedirect('/about-pct/team', '/about-pct#team');
Route::permanentRedirect('/about-pct/advisory-board', '/about-pct#advisory-board');
Route::permanentRedirect('/about-pct/ambassadors', '/about-pct#ambassadors');
Route::permanentRedirect('/about-pct/background-information', '/about-pct#background');

Route::get('/disclaimer', ContentPageController::class)->name('disclaimer');

Route::get('/help', [HelpController::class, 'index'])->name('help');
Route::post('/help/{id}/feedback', [HelpController::class, 'feedback'])->whereNumber('id')->middleware('throttle:30,1')->name('help.feedback');

Route::get('/news', [NewsController::class, 'index'])->name('news');
Route::get('/news/view-item/{id}', [NewsController::class, 'show'])->whereNumber('id')->name('news.show');

Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1')->name('contact.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/database/view-protocol/{id}', [ProtocolPageController::class, 'show'])->whereNumber('id')->name('protocols.show');
    Route::post('/database/view-protocol/{id}/ask', [ProtocolPageController::class, 'ask'])->whereNumber('id')->name('protocols.ask');
    Route::get('/database/view-protocol/{id}/pdf', [ProtocolPdfController::class, 'protocol'])->whereNumber('id')->middleware('throttle:30,1')->name('protocols.pdf');
});

Route::get('/admin{any}', function () {
    return view('index');
})->where('any', '.*')->middleware(['auth', 'verified', 'admin'])->name('admin');

Route::fallback(function () {
    return view('index');
});

// The researcher workspace in the A2 design. Pages not rebuilt yet fall through to the legacy SPA.
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/', DashboardController::class)->name('workspace.dashboard');
    Route::get('/manage-protocols', [MyProtocolsController::class, 'index'])->name('workspace.protocols');
    Route::get('/add-protocol', [ProtocolFormController::class, 'create'])->name('workspace.protocols.create');
    Route::get('/edit-protocol/{id}', [ProtocolFormController::class, 'edit'])->whereNumber('id')->name('workspace.protocols.edit');
    Route::post('/protocols', [ProtocolFormController::class, 'store'])->middleware('throttle:30,1')->name('workspace.protocols.store');
    Route::post('/protocols/import', [ProtocolFormController::class, 'import'])->middleware('throttle:10,1')->name('workspace.protocols.import');
    Route::whereNumber('id')->prefix('protocols/{id}')->group(function () {
        Route::post('/duplicate', [MyProtocolsController::class, 'duplicate'])->name('workspace.protocols.duplicate');
        Route::put('/answers', [ProtocolFormController::class, 'update'])->middleware('throttle:120,1')->name('workspace.protocols.update');
        Route::post('/amend', [ProtocolFormController::class, 'amend'])->name('workspace.protocols.amend');
        Route::post('/images', [ProtocolFormController::class, 'uploadImage'])->middleware('throttle:30,1')->name('workspace.protocols.images');
        Route::delete('/', [MyProtocolsController::class, 'destroy'])->name('workspace.protocols.destroy');
        Route::post('/submit', [MyProtocolsController::class, 'submit'])->name('workspace.protocols.submit');
        Route::post('/comments', [MyProtocolsController::class, 'comment'])->middleware('throttle:30,1')->name('workspace.protocols.comment');
        Route::post('/comments/read', [MyProtocolsController::class, 'readComments'])->name('workspace.protocols.comments.read');
        Route::put('/links', [MyProtocolsController::class, 'link'])->name('workspace.protocols.link');
    });
    Route::get('/protocols/{id}/certificate.pdf', [ProtocolPdfController::class, 'certificate'])->whereNumber('id')->middleware('throttle:30,1')->name('workspace.certificate');
});

Route::get('/dashboard{any}', function () {
    return view('index');
})->where('any', '.*')->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__ . '/auth.php';
