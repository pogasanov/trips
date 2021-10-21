<?php

use App\Http\Controllers\AdvanceController;
use App\Http\Controllers\BootstrapController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\UpdateController;
use Illuminate\Http\Request;

use App\Http\Controllers\UserController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/pin', [UserController::class, 'requestPin']);
Route::post('/login', [UserController::class, 'login']);

Route::group(['middleware' => 'auth:onec'], function () {
    Route::post('/update', [UpdateController::class, 'update']);
});

Route::group(['middleware' => 'auth'], function () {
    Route::get('/bootstrap', [BootstrapController::class, 'bootstrap']);

    Route::get('/trip', [TripController::class, 'list']);
    Route::post('/trip', [TripController::class, 'create']);
    Route::get('/trip/basis', [TripController::class, 'basisList']);
    Route::post('/trip/{uuid}/file', [TripController::class, 'addFile']);
    Route::get('/trip/{uuid}', [TripController::class, 'show']);
    Route::put('/trip/{uuid}', [TripController::class, 'update']);
    Route::delete('/trip/{uuid}', [TripController::class, 'delete']);

    Route::get('/advance', [AdvanceController::class, 'list']);
    Route::post('/advance', [AdvanceController::class, 'create']);
    Route::get('/advance/purpose', [AdvanceController::class, 'purposeList']);
    Route::get('/advance/fill', [AdvanceController::class, 'fillUsingBasis']);
    Route::post('/advance/{uuid}/file', [AdvanceController::class, 'addFile']);
    Route::get('/advance/{uuid}', [AdvanceController::class, 'show']);
    Route::put('/advance/{uuid}', [AdvanceController::class, 'update']);
    Route::delete('/advance/{uuid}', [AdvanceController::class, 'delete']);
});
