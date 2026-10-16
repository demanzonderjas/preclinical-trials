<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Every page is rendered by the React SPA in resources/views/index.blade.php;
| these routes only decide who may load which part of it.
|
*/

Route::get('/', function () {
    return view('index');
})->name('index');

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
