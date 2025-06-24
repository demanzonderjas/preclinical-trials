<?php

use App\Http\Controllers\Auth\NewPasswordController;
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
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('protocols/mine', 'ProtocolController@mine');
    Route::get('protocols/mine-published', 'ProtocolController@minePublished');
    Route::get('protocols/linked/{protocol_id}', 'ProtocolController@getLinked');

    Route::middleware(['auth:sanctum', 'verified'])->post('update-profile', 'UserController@updateProfile');
    Route::middleware(['auth:sanctum', 'verified'])->post('update-setting', 'SettingController@update');

    Route::middleware(['auth:sanctum', 'verified'])->post('protocol', 'ProtocolController@store');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->delete('protocol/{protocol_id}', 'ProtocolController@delete');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocol/duplicate/{protocol_id}', 'ProtocolController@duplicate');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->put('protocol', 'ProtocolController@update');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocol/submit-for-publication', 'ProtocolController@submitForPublication');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocols/link', 'ProtocolController@link');

    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->get('embargo-end-date/{protocol_id}', 'EmbargoController@get');
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('embargo-end-date/{protocol_id}', 'EmbargoController@store');

    Route::middleware(['auth:sanctum', 'verified'])->get('protocol/{protocol_id}', 'ProtocolController@get');
    Route::get('protocol/{protocol_id}/status', 'ProtocolController@getStatus');
    Route::get('protocols', 'ProtocolController@getViewable');
    Route::get('protocols/counts', 'ProtocolController@counts');
    Route::post('protocols/counts-per-country', 'ProtocolController@countsPerCountry');

    Route::get('news-items', 'NewsItemController@getViewable');
    Route::get('news-item/{news_item_id}', 'NewsItemController@get');

    Route::get('faq', 'FaqController@getByCategory');
    Route::get('faq-categories', 'FaqController@getCategories');

    Route::get('ambassadors', 'AmbassadorController@getAll');

    Route::post('page/slug', 'PageController@getBySlug');
    Route::get('page/{page_id}', 'PageController@getById');

    Route::group(['middleware' => 'throttle:10,1'], function () {
        Route::post('contact-form', 'ContactFormController@store');
    });

    Route::post('channel/id', 'ChannelController@getChannelId');
    Route::post('channel/get-protocol-id', 'ChannelController@getProtocolId');
    Route::get('channels/mine', 'ChannelController@mine');

    Route::group(['middleware' => 'channel'], function () {
        Route::post('channel/messages', 'ChannelController@getMessages');
        Route::post('channel/message', 'MessageController@store');
        Route::post('channel/block', 'ChannelController@block');
    });

    Route::post('translate', 'AIController@translate');

    Route::group(['middleware' => 'admin'], function () {

        Route::post('/admin/change-password', [NewPasswordController::class, 'resetAsAdmin']);

        Route::get('protocols/admin', 'ProtocolController@getViewableForAdmin');
        Route::post('protocol/{protocol_id}/approve', 'ProtocolController@approve');
        Route::post('protocol/{protocol_id}/reject', 'ProtocolController@reject');
        Route::get('protocols/counts-rejected', 'ProtocolController@countsRejected');
        Route::get('protocols/counts-per-month', 'ProtocolController@countsPerMonth');
        Route::get('import-logs', 'ProtocolController@getImportLogs');

        Route::post('news-item', 'NewsItemController@store');
        Route::post('news-item/upload-image', 'NewsItemController@uploadImage');
        Route::post('news-item/delete-image', 'NewsItemController@deleteImage');
        Route::put('news-item', 'NewsItemController@update');
        Route::get('news-items/admin', 'NewsItemController@getViewableForAdmin');
        Route::delete('news-item/{news_item_id}', 'NewsItemController@delete');

        Route::get('users/counts-total', 'UserController@getCountsTotal');
        Route::get('users/regions', 'UserController@getRegionSpecificStats');

        Route::post('ambassador', 'AmbassadorController@store');
        Route::delete('ambassador/{ambassador_id}', 'AmbassadorController@delete');

        Route::post('faq-item', 'FaqController@store');
        Route::put('faq-item', 'FaqController@update');
        Route::get('faq-items/admin', 'FaqController@getViewableForAdmin');
        Route::get('faq-item/{itemId}', 'FaqController@get');
        Route::delete('faq-item/{news_item_id}', 'FaqController@delete');

        Route::put('page', 'PageController@update');
        Route::get('pages', 'PageController@getAll');

        Route::get('embargo-extensions', 'EmbargoController@all');
        Route::post('embargo-extension/{embargo_extension}/approve', 'EmbargoController@approve');
        Route::post('embargo-extension/{embargo_extension}/reject', 'EmbargoController@reject');

        Route::get('users', 'UserController@getAll');
    });

    Route::middleware('iles')->post('iles/protocol', 'ProtocolController@storeILES')->name('iles.protocol');
    Route::middleware('external-api')->get('external/viewable-protocols', 'ProtocolController@getViewable')->name('external-api.viewable');

    Route::fallback(function () {
        return abort(404, "invalid_api_route");
    });
});
