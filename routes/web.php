<?php

use App\Http\Controllers\Pages\ContactController;
use App\Http\Controllers\Pages\DatabaseController;
use App\Http\Controllers\Pages\HomeController;
use App\Http\Controllers\Pages\NewsController;
use App\Http\Controllers\Pages\ProtocolPageController;
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

Route::get('/news', [NewsController::class, 'index'])->name('news');
Route::get('/news/view-item/{id}', [NewsController::class, 'show'])->whereNumber('id')->name('news.show');

Route::get('/contact', [ContactController::class, 'show'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1')->name('contact.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/database/view-protocol/{id}', [ProtocolPageController::class, 'show'])->whereNumber('id')->name('protocols.show');
    Route::post('/database/view-protocol/{id}/ask', [ProtocolPageController::class, 'ask'])->whereNumber('id')->name('protocols.ask');
});

Route::get('/admin{any}', function () {
    return view('index');
})->where('any', '.*')->middleware(['auth', 'verified', 'admin'])->name('admin');

Route::fallback(function () {
    return view('index');
});

Route::get('/verify-email', function () {
    return view('index');
})->where('any', '.*')->middleware(['auth', 'verified'])->name('verify.email');

Route::get('/dashboard{any}', function () {
    return view('index');
})->where('any', '.*')->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__ . '/auth.php';
