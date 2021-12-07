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
    Route::get('protocol/{protocol_id}/status', 'ProtocolController@getStatus');
    Route::get('protocols', 'ProtocolController@getViewable');
    Route::get('protocols/counts', 'ProtocolController@counts');
    Route::get('news-items', 'NewsItemController@getViewable');
    Route::get('news-item/{news_item_id}', 'NewsItemController@get');

    Route::get('faq', 'FaqController@getByCategory');
    Route::get('faq-items', 'FaqController@getAllItems');
    Route::get('faq-items/{itemId}', 'FaqController@getItemById');
    Route::post('faq-items/create', 'FaqController@createItem');
    Route::post('faq-items/edit/{itemId}', 'FaqController@editItem');
    Route::post('faq-items/delete/{itemId}', 'FaqController@deleteItem');

    Route::group(['middleware' => 'admin'], function () {
        Route::get('protocols/admin', 'ProtocolController@getViewableForAdmin');
        Route::post('protocol/{protocol_id}/approve', 'ProtocolController@approve');
        Route::post('protocol/{protocol_id}/reject', 'ProtocolController@reject');
        Route::post('news-item', 'NewsItemController@store');
        Route::get('news-items/admin', 'NewsItemController@getViewableForAdmin');
    });
});
