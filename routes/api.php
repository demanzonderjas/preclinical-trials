<?php

use App\Http\Controllers\Api\ProtocolController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| The two external integrations, prefixed with /api. Both answer HTTP 200 with
| {success: false, message} on errors, as the integrations expect. The JSON API of
| the former SPA was removed in phase 6 (see docs/modernization/DEPLOY.md).
|
*/

Route::middleware('iles')->post('iles/protocol', [ProtocolController::class, 'storeILES'])->name('iles.protocol');
Route::middleware('external-api')->get('external/viewable-protocols', [ProtocolController::class, 'getViewable'])->name('external-api.viewable');

Route::fallback(function () {
    return abort(404, "invalid_api_route");
});
