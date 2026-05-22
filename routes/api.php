<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('locations')->name('api.')->group(function () {
    Route::get('/counties', [ApiController::class, 'counties'])->name('counties');
    Route::get('/sub-counties/{countyId}', [ApiController::class, 'subCounties'])->name('sub-counties');
    Route::get('/wards/{subCountyId}', [ApiController::class, 'wards'])->name('wards');
    Route::get('/villages/{wardId}', [ApiController::class, 'villages'])->name('villages');

    Route::get('/partners', [ApiController::class, 'partners'])->name('partners');
    Route::get('/organization-types', [ApiController::class, 'organizationTypes'])->name('organization-types');
});
