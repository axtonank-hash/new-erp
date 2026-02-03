<?php

/**
 * PHASE 2 - ENHANCED STUDENT MANAGEMENT ROUTES
 * 
 * API Routes for:
 * - Student Profile Management
 * - Clinical Posting Management
 * - Document Management
 * - Hospital Affiliation Management
 * 
 * All routes prefixed with /api/v2/nursing-pharmacy
 * Requires Sanctum authentication
 */

use App\Http\Controllers\Api\NursingPharmacyStudentProfileController;
use App\Http\Controllers\Api\NursingPharmacyClinicalPostingController;
use App\Http\Controllers\Api\NursingPharmacyStudentDocumentController;
use App\Http\Controllers\Api\NursingPharmacyHospitalController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('v2/nursing-pharmacy')->group(function () {
    // ==================== STUDENT PROFILES ====================
    Route::prefix('students/profiles')->group(function () {
        // List and create student profiles
        Route::get('/', [NursingPharmacyStudentProfileController::class, 'index'])
            ->name('nursing-pharmacy.student-profiles.index');
        Route::post('/', [NursingPharmacyStudentProfileController::class, 'store'])
            ->name('nursing-pharmacy.student-profiles.store');

        // Show, update, delete specific profile
        Route::get('/{studentProfile}', [NursingPharmacyStudentProfileController::class, 'show'])
            ->name('nursing-pharmacy.student-profiles.show');
        Route::put('/{studentProfile}', [NursingPharmacyStudentProfileController::class, 'update'])
            ->name('nursing-pharmacy.student-profiles.update');
        Route::delete('/{studentProfile}', [NursingPharmacyStudentProfileController::class, 'destroy'])
            ->name('nursing-pharmacy.student-profiles.destroy');

        // Student profile business logic endpoints
        Route::post('/{studentProfile}/check-eligibility', [NursingPharmacyStudentProfileController::class, 'checkExamEligibility'])
            ->name('nursing-pharmacy.student-profiles.check-eligibility');
        Route::get('/{studentProfile}/progress', [NursingPharmacyStudentProfileController::class, 'getProgressMetrics'])
            ->name('nursing-pharmacy.student-profiles.progress');
        Route::get('/{studentProfile}/eligibility-status', [NursingPharmacyStudentProfileController::class, 'getEligibilityStatus'])
            ->name('nursing-pharmacy.student-profiles.eligibility-status');
    });

    // ==================== CLINICAL POSTINGS ====================
    Route::prefix('clinical-postings')->group(function () {
        // List and create clinical postings
        Route::get('/', [NursingPharmacyClinicalPostingController::class, 'index'])
            ->name('nursing-pharmacy.clinical-postings.index');
        Route::post('/', [NursingPharmacyClinicalPostingController::class, 'store'])
            ->name('nursing-pharmacy.clinical-postings.store');

        // Show, update, delete specific posting
        Route::get('/{clinicalPosting}', [NursingPharmacyClinicalPostingController::class, 'show'])
            ->name('nursing-pharmacy.clinical-postings.show');
        Route::put('/{clinicalPosting}', [NursingPharmacyClinicalPostingController::class, 'update'])
            ->name('nursing-pharmacy.clinical-postings.update');
        Route::delete('/{clinicalPosting}', [NursingPharmacyClinicalPostingController::class, 'destroy'])
            ->name('nursing-pharmacy.clinical-postings.destroy');

        // Clinical posting business logic endpoints
        Route::post('/auto-allocate', [NursingPharmacyClinicalPostingController::class, 'autoAllocate'])
            ->name('nursing-pharmacy.clinical-postings.auto-allocate');
        Route::get('/{clinicalPosting}/summary', [NursingPharmacyClinicalPostingController::class, 'getSummary'])
            ->name('nursing-pharmacy.clinical-postings.summary');
        Route::post('/{clinicalPosting}/log-hours', [NursingPharmacyClinicalPostingController::class, 'logHours'])
            ->name('nursing-pharmacy.clinical-postings.log-hours');
        Route::post('/{clinicalPosting}/update-status', [NursingPharmacyClinicalPostingController::class, 'updateStatus'])
            ->name('nursing-pharmacy.clinical-postings.update-status');
        Route::get('/{clinicalPosting}/hospital-mapping', [NursingPharmacyClinicalPostingController::class, 'getHospitalMapping'])
            ->name('nursing-pharmacy.clinical-postings.hospital-mapping');
    });

    // ==================== STUDENT DOCUMENTS ====================
    Route::prefix('students/documents')->group(function () {
        // List and upload documents
        Route::get('/', [NursingPharmacyStudentDocumentController::class, 'index'])
            ->name('nursing-pharmacy.student-documents.index');
        Route::post('/upload', [NursingPharmacyStudentDocumentController::class, 'upload'])
            ->name('nursing-pharmacy.student-documents.upload');

        // Show specific document
        Route::get('/{studentDocument}', [NursingPharmacyStudentDocumentController::class, 'show'])
            ->name('nursing-pharmacy.student-documents.show');
        Route::delete('/{studentDocument}', [NursingPharmacyStudentDocumentController::class, 'destroy'])
            ->name('nursing-pharmacy.student-documents.destroy');

        // Document verification and management endpoints
        Route::post('/{studentDocument}/verify', [NursingPharmacyStudentDocumentController::class, 'verify'])
            ->name('nursing-pharmacy.student-documents.verify');
        Route::post('/{studentDocument}/reject', [NursingPharmacyStudentDocumentController::class, 'reject'])
            ->name('nursing-pharmacy.student-documents.reject');
        Route::get('/{studentDocument}/history', [NursingPharmacyStudentDocumentController::class, 'getHistory'])
            ->name('nursing-pharmacy.student-documents.history');
        Route::get('/{studentDocument}/preview', [NursingPharmacyStudentDocumentController::class, 'getPreview'])
            ->name('nursing-pharmacy.student-documents.preview');
        Route::get('/student/{studentProfile}/compliance-status', [NursingPharmacyStudentDocumentController::class, 'getComplianceStatus'])
            ->name('nursing-pharmacy.student-documents.compliance-status');
        Route::post('/verify-bulk', [NursingPharmacyStudentDocumentController::class, 'bulkVerify'])
            ->name('nursing-pharmacy.student-documents.bulk-verify');
    });

    // ==================== HOSPITALS & DEPARTMENTS ====================
    Route::prefix('hospitals')->group(function () {
        // List and create hospitals
        Route::get('/', [NursingPharmacyHospitalController::class, 'index'])
            ->name('nursing-pharmacy.hospitals.index');
        Route::post('/', [NursingPharmacyHospitalController::class, 'store'])
            ->name('nursing-pharmacy.hospitals.store');

        // Show, update, delete specific hospital
        Route::get('/{hospital}', [NursingPharmacyHospitalController::class, 'show'])
            ->name('nursing-pharmacy.hospitals.show');
        Route::put('/{hospital}', [NursingPharmacyHospitalController::class, 'update'])
            ->name('nursing-pharmacy.hospitals.update');
        Route::delete('/{hospital}', [NursingPharmacyHospitalController::class, 'destroy'])
            ->name('nursing-pharmacy.hospitals.destroy');

        // Hospital management endpoints
        Route::get('/{hospital}/capacity', [NursingPharmacyHospitalController::class, 'getCapacity'])
            ->name('nursing-pharmacy.hospitals.capacity');
        Route::get('/{hospital}/departments', [NursingPharmacyHospitalController::class, 'getDepartments'])
            ->name('nursing-pharmacy.hospitals.departments');
        Route::post('/{hospital}/departments', [NursingPharmacyHospitalController::class, 'addDepartment'])
            ->name('nursing-pharmacy.hospitals.add-department');
        Route::get('/available-for-posting', [NursingPharmacyHospitalController::class, 'getAvailableForPosting'])
            ->name('nursing-pharmacy.hospitals.available-for-posting');
    });
});
