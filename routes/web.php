<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\{
    DashboardController,
    GbvCaseController,
    CaseFileController,
    PartnerController,
    ProfileController,
    ReferralController,
    ReportController,
    SurvivorController,
    UserController
};

use App\Http\Controllers\Setting\{
    CountyController,
    SubCountyController,
    WardController
};

/*
|--------------------------------------------------------------------------
| Public Pages
|--------------------------------------------------------------------------
*/

Route::inertia('/', 'Home')->name('home');
Route::inertia('/terms', 'Terms')->name('terms');
Route::inertia('/privacy', 'Privacy')->name('privacy');
Route::inertia('/policies', 'Policies')->name('policies');
Route::inertia('/faqs', 'FAQ')->name('faqs');

/*
|--------------------------------------------------------------------------
| Partner Registration
|--------------------------------------------------------------------------
*/

Route::prefix('partner')
    ->name('partner.')
    ->controller(PartnerController::class)
    ->group(function () {
        Route::post('/register', 'store')->name('register');
        Route::inertia('/inactive', 'Auth/Inactive')->name('inactive');
    });

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
|
| Middleware Stack:
| - auth
| - verified
| - active (recommended custom middleware)
|
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth',
    'verified',
    'partner.status',
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Survivors
    |--------------------------------------------------------------------------
    */

    Route::resource('survivors', SurvivorController::class);

    Route::prefix('survivors/{survivor}')
        ->name('survivors.')
        ->controller(SurvivorController::class)
        ->group(function () {
            Route::post('/consent', 'updateConsent')->name('consent');
        });

    /*
    |--------------------------------------------------------------------------
    | GBV Cases
    |--------------------------------------------------------------------------
    */

    Route::resource('gbv-cases', GbvCaseController::class);

    Route::prefix('gbv-cases/{gbvCase}')
        ->name('gbv-cases.')
        ->controller(GbvCaseController::class)
        ->group(function () {
            Route::put('/status', 'updateStatus')->name('status');
            Route::put('/conclude', 'conclude')->name('conclude');
            Route::post('/upload-audio', 'uploadAudio')->name('upload-audio');
            Route::get('/download-pdf', 'downloadPdf')->name('download-pdf');
        });

    /*
    |--------------------------------------------------------------------------
    | Case Files
    |--------------------------------------------------------------------------
    */

    Route::prefix('gbv-cases/{gbvCase}/files')
        ->name('gbv-cases.files.')
        ->controller(CaseFileController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('/{caseFile}', 'show')->name('show');
            Route::get('/{caseFile}/edit', 'edit')->name('edit');
            Route::put('/{caseFile}', 'update')->name('update');
            Route::delete('/{caseFile}', 'destroy')->name('destroy');
            Route::post('/bulk-delete', 'bulkDestroy')->name('bulk-destroy');

            /*
            |--------------------------------------------------------------------------
            | File Actions
            |--------------------------------------------------------------------------
            */

            Route::get('/{caseFile}/download', 'download')->name('download');
            Route::get('/{caseFile}/preview', 'preview')->name('preview');
            Route::get('/{caseFile}/download-url', 'getDownloadUrl')->name('download-url');
            Route::post('/{caseFile}/status', 'updateStatus')->name('update-status');
            Route::post('/{caseFile}/versions', 'uploadVersion')->name('upload-version');

            /*
            |--------------------------------------------------------------------------
            | File Sharing
            |--------------------------------------------------------------------------
            */

            Route::post('/{caseFile}/share', 'share')->name('share');
            Route::delete('/{caseFile}/share/{partnerId}', 'removeSharing')->name('remove-sharing');
        });

    /*
    |--------------------------------------------------------------------------
    | Referrals
    |--------------------------------------------------------------------------
    */

    Route::resource('referrals', ReferralController::class);

    Route::prefix('referrals/{referral}')
        ->name('referrals.')
        ->controller(ReferralController::class)
        ->group(function () {
            Route::put('/status', 'updateStatus')->name('status');
            Route::get('/pending/receive', 'pendingReceived')->name('pending-received');
        });

    /*
    |--------------------------------------------------------------------------
    | Partners
    |--------------------------------------------------------------------------
    */

    Route::resource('partners', PartnerController::class)->except(['create', 'store']);

    Route::prefix('partners/{partner}')
        ->name('partners.')
        ->controller(PartnerController::class)
        ->group(function () {
            Route::post('/approve', 'approve')->name('approve');
            Route::post('/reject', 'reject')->name('reject');
        });

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::prefix('reports')
        ->name('reports.')
        ->controller(ReportController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/generate', 'generate')->name('generate');
            Route::get('/export/excel', 'exportExcel')->name('export.excel');
            Route::get('/export/pdf', 'exportPdf')->name('export.pdf');
        });

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    Route::resource('users', UserController::class);

    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::prefix('profile')
        ->name('profile.')
        ->controller(ProfileController::class)
        ->group(function () {
            Route::get('/', 'edit')->name('edit');
            Route::patch('/', 'update')->name('update');
            Route::delete('/', 'destroy')->name('destroy');
        });

    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    */

    Route::prefix('settings')
        ->name('settings.')
        ->group(function () {

            Route::resources([
                'counties' => CountyController::class,
                'sub-counties' => SubCountyController::class,
                'wards' => WardController::class,
            ]);
        });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';
