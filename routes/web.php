<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
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
