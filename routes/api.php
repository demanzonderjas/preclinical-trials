<?php

use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\AmbassadorController;
use App\Http\Controllers\Api\ChannelController;
use App\Http\Controllers\Api\ContactFormController;
use App\Http\Controllers\Api\EmbargoController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NewsItemController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ProtocolController;
use App\Http\Controllers\Api\ProtocolImageController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| JSON endpoints of the React SPA (session-authenticated through Sanctum),
| plus the two external integrations at the bottom. Prefixed with /api.
|
*/

Route::group([], function () {
    // Returns null for guests; the SPA uses it to check whether someone is logged in.
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        Route::get('protocols/mine', [ProtocolController::class, 'mine']);
        Route::get('protocols/mine-published', [ProtocolController::class, 'minePublished']);
        Route::get('protocols/linked/{protocol_id}', [ProtocolController::class, 'getLinked']);
    });

    Route::middleware(['auth:sanctum', 'verified'])->post('update-profile', [UserController::class, 'updateProfile']);
    Route::middleware(['auth:sanctum', 'verified'])->post('update-setting', [SettingController::class, 'update']);

    Route::middleware(['auth:sanctum', 'verified'])->post('protocol', [ProtocolController::class, 'store']);
    Route::middleware(['auth:sanctum', 'verified'])->post('protocol/upload-image', [ProtocolImageController::class, 'upload']);
    Route::middleware(['auth:sanctum', 'verified'])->post('protocol/delete-image', [ProtocolImageController::class, 'delete']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->delete('protocol/{protocol_id}', [ProtocolController::class, 'delete']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocol/duplicate/{protocol_id}', [ProtocolController::class, 'duplicate']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->put('protocol', [ProtocolController::class, 'update']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocol/submit-for-publication', [ProtocolController::class, 'submitForPublication']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('protocols/link', [ProtocolController::class, 'link']);

    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->get('embargo-end-date/{protocol_id}', [EmbargoController::class, 'get']);
    Route::middleware(['auth:sanctum', 'auth.owner', 'verified'])->post('embargo-end-date/{protocol_id}', [EmbargoController::class, 'store']);

    Route::middleware(['auth:sanctum', 'verified'])->get('protocol/{protocol_id}', [ProtocolController::class, 'get']);
    Route::get('protocol/{protocol_id}/status', [ProtocolController::class, 'getStatus']);
    Route::get('protocols', [ProtocolController::class, 'getViewable']);
    Route::get('protocols/counts', [ProtocolController::class, 'counts']);
    Route::post('protocols/counts-per-country', [ProtocolController::class, 'countsPerCountry']);

    Route::get('news-items', [NewsItemController::class, 'getViewable']);
    Route::get('news-item/{news_item_id}', [NewsItemController::class, 'get']);

    Route::get('faq', [FaqController::class, 'getByCategory']);
    Route::get('faq-categories', [FaqController::class, 'getCategories']);

    Route::get('ambassadors', [AmbassadorController::class, 'getAll']);

    Route::post('page/slug', [PageController::class, 'getBySlug']);
    Route::get('page/{page_id}', [PageController::class, 'getById']);

    Route::group(['middleware' => 'throttle:10,1'], function () {
        Route::post('contact-form', [ContactFormController::class, 'store']);
    });

    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        Route::post('channel/id', [ChannelController::class, 'getChannelId']);
        Route::post('channel/get-protocol-id', [ChannelController::class, 'getProtocolId']);
        Route::get('channels/mine', [ChannelController::class, 'mine']);

        Route::group(['middleware' => 'channel'], function () {
            Route::post('channel/messages', [ChannelController::class, 'getMessages']);
            Route::post('channel/message', [MessageController::class, 'store']);
            Route::post('channel/block', [ChannelController::class, 'block']);
        });

        // Calls OpenAI on the server's key, so only for verified users and rate limited.
        Route::post('translate', [AIController::class, 'translate'])->middleware('throttle:20,1');
    });

    Route::group(['middleware' => 'admin'], function () {

        Route::post('/admin/change-password', [NewPasswordController::class, 'resetAsAdmin']);

        Route::get('protocols/admin', [ProtocolController::class, 'getViewableForAdmin']);
        Route::post('protocol/{protocol_id}/approve', [ProtocolController::class, 'approve']);
        Route::post('protocol/{protocol_id}/reject', [ProtocolController::class, 'reject']);
        Route::get('protocols/counts-rejected', [ProtocolController::class, 'countsRejected']);
        Route::get('protocols/counts-per-month', [ProtocolController::class, 'countsPerMonth']);
        Route::get('import-logs', [ProtocolController::class, 'getImportLogs']);

        Route::post('news-item', [NewsItemController::class, 'store']);
        Route::post('news-item/upload-image', [NewsItemController::class, 'uploadImage']);
        Route::post('news-item/delete-image', [NewsItemController::class, 'deleteImage']);
        Route::put('news-item', [NewsItemController::class, 'update']);
        Route::get('news-items/admin', [NewsItemController::class, 'getViewableForAdmin']);
        Route::delete('news-item/{news_item_id}', [NewsItemController::class, 'delete']);

        Route::get('users/counts-total', [UserController::class, 'getCountsTotal']);
        Route::get('users/regions', [UserController::class, 'getRegionSpecificStats']);

        Route::post('ambassador', [AmbassadorController::class, 'store']);
        Route::delete('ambassador/{ambassador_id}', [AmbassadorController::class, 'delete']);

        Route::post('faq-item', [FaqController::class, 'store']);
        Route::put('faq-item', [FaqController::class, 'update']);
        Route::get('faq-items/admin', [FaqController::class, 'getViewableForAdmin']);
        Route::get('faq-item/{itemId}', [FaqController::class, 'get']);
        Route::delete('faq-item/{news_item_id}', [FaqController::class, 'delete']);

        Route::put('page', [PageController::class, 'update']);
        Route::get('pages', [PageController::class, 'getAll']);

        Route::get('embargo-extensions', [EmbargoController::class, 'all']);
        Route::post('embargo-extension/{embargo_extension}/approve', [EmbargoController::class, 'approve']);
        Route::post('embargo-extension/{embargo_extension}/reject', [EmbargoController::class, 'reject']);
        Route::post('embargo-end-date/{protocol_id}/extend', [EmbargoController::class, 'extendAsAdmin']);

        Route::get('users', [UserController::class, 'getAll']);
    });

    Route::middleware('iles')->post('iles/protocol', [ProtocolController::class, 'storeILES'])->name('iles.protocol');
    Route::middleware('external-api')->get('external/viewable-protocols', [ProtocolController::class, 'getViewable'])->name('external-api.viewable');

    Route::fallback(function () {
        return abort(404, "invalid_api_route");
    });
});
