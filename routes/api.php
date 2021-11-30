<?php

use App\Http\Controllers\Api\NewsItemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['namespace' => 'Api'], function () {
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('protocols/mine', 'ProtocolController@mine');
    Route::middleware('auth:sanctum')->post('protocol', 'ProtocolController@store');
    Route::middleware(['auth:sanctum', 'auth.owner'])->delete('protocol/{protocol_id}', 'ProtocolController@delete');
    Route::middleware(['auth:sanctum', 'auth.owner'])->put('protocol', 'ProtocolController@update');
    Route::middleware(['auth:sanctum', 'auth.owner'])->post('protocol/submit-for-publication', 'ProtocolController@submitForPublication');
    Route::get('protocol/{protocol_id}', 'ProtocolController@get');
    Route::get('protocols', 'ProtocolController@getViewable');
    Route::get('protocols/counts', 'ProtocolController@counts');
    Route::get('news-items', 'NewsItemController@getViewable');
});
