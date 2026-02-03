<?php

/**
 * PHASE 3 - FACULTY & ATTENDANCE MANAGEMENT ROUTES
 * 
 * API Routes for:
 * - Faculty Management with INC/PCI compliance
 * - Advanced Attendance System with eligibility checking
 * - Clinical Logbook management (Nursing)
 * - Lab & Practical management (Pharmacy)
 * 
 * All routes prefixed with /api/v3/nursing-pharmacy
 * Requires Sanctum authentication
 */

use App\Http\Controllers\Api\NursingPharmacyFacultyController;
use App\Http\Controllers\Api\NursingPharmacyAttendanceController;
use App\Http\Controllers\Api\NursingPharmacyClinicalLogbookController;
use App\Http\Controllers\Api\NursingPharmacyLabPracticalController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('v3/nursing-pharmacy')->group(function () {
    // ==================== FACULTY MANAGEMENT ====================
    Route::prefix('faculty')->group(function () {
        // List and create faculty
        Route::get('/', [NursingPharmacyFacultyController::class, 'index'])
            ->name('nursing-pharmacy.faculty.index');
        Route::post('/', [NursingPharmacyFacultyController::class, 'store'])
            ->name('nursing-pharmacy.faculty.store');

        // Show, update, delete specific faculty
        Route::get('/{faculty}', [NursingPharmacyFacultyController::class, 'show'])
            ->name('nursing-pharmacy.faculty.show');
        Route::put('/{faculty}', [NursingPharmacyFacultyController::class, 'update'])
            ->name('nursing-pharmacy.faculty.update');
        Route::delete('/{faculty}', [NursingPharmacyFacultyController::class, 'destroy'])
            ->name('nursing-pharmacy.faculty.destroy');

        // Faculty business logic endpoints
        Route::post('/{faculty}/assign-subject', [NursingPharmacyFacultyController::class, 'assignSubject'])
            ->name('nursing-pharmacy.faculty.assign-subject');
        Route::get('/{faculty}/subjects', [NursingPharmacyFacultyController::class, 'getSubjects'])
            ->name('nursing-pharmacy.faculty.subjects');
        Route::get('/{faculty}/availability', [NursingPharmacyFacultyController::class, 'getAvailability'])
            ->name('nursing-pharmacy.faculty.availability');
        Route::get('/{faculty}/compliance', [NursingPharmacyFacultyController::class, 'getCompliance'])
            ->name('nursing-pharmacy.faculty.compliance');
    });

    // ==================== ATTENDANCE MANAGEMENT ====================
    Route::prefix('attendance')->group(function () {
        // Record single attendance
        Route::post('/record', [NursingPharmacyAttendanceController::class, 'recordAttendance'])
            ->name('nursing-pharmacy.attendance.record');

        // Bulk record attendance
        Route::post('/bulk-record', [NursingPharmacyAttendanceController::class, 'bulkRecord'])
            ->name('nursing-pharmacy.attendance.bulk-record');

        // Get student attendance summary
        Route::get('/student/{studentId}/summary', [NursingPharmacyAttendanceController::class, 'getStudentSummary'])
            ->name('nursing-pharmacy.attendance.student-summary');

        // Check exam eligibility
        Route::post('/student/{studentId}/check-eligibility', [NursingPharmacyAttendanceController::class, 'checkEligibility'])
            ->name('nursing-pharmacy.attendance.check-eligibility');

        // Get attendance thresholds
        Route::get('/program/{programId}/thresholds', [NursingPharmacyAttendanceController::class, 'getThresholds'])
            ->name('nursing-pharmacy.attendance.thresholds');

        // Department attendance report
        Route::get('/department/{departmentId}/report', [NursingPharmacyAttendanceController::class, 'getDepartmentReport'])
            ->name('nursing-pharmacy.attendance.department-report');

        // Approve pending attendance
        Route::post('/record/{record}/approve', [NursingPharmacyAttendanceController::class, 'approveAttendance'])
            ->name('nursing-pharmacy.attendance.approve');
    });

    // ==================== CLINICAL LOGBOOKS ====================
    Route::prefix('clinical-logbooks')->group(function () {
        // List and create logbooks
        Route::get('/', [NursingPharmacyClinicalLogbookController::class, 'index'])
            ->name('nursing-pharmacy.clinical-logbooks.index');
        Route::post('/', [NursingPharmacyClinicalLogbookController::class, 'store'])
            ->name('nursing-pharmacy.clinical-logbooks.store');

        // Show, update, delete specific logbook
        Route::get('/{clinicalLogbook}', [NursingPharmacyClinicalLogbookController::class, 'show'])
            ->name('nursing-pharmacy.clinical-logbooks.show');
        Route::put('/{clinicalLogbook}', [NursingPharmacyClinicalLogbookController::class, 'update'])
            ->name('nursing-pharmacy.clinical-logbooks.update');
        Route::delete('/{clinicalLogbook}', [NursingPharmacyClinicalLogbookController::class, 'destroy'])
            ->name('nursing-pharmacy.clinical-logbooks.destroy');

        // Clinical logbook workflow endpoints
        Route::post('/{clinicalLogbook}/submit', [NursingPharmacyClinicalLogbookController::class, 'submit'])
            ->name('nursing-pharmacy.clinical-logbooks.submit');
        Route::post('/{clinicalLogbook}/approve', [NursingPharmacyClinicalLogbookController::class, 'approve'])
            ->name('nursing-pharmacy.clinical-logbooks.approve');
        Route::post('/{clinicalLogbook}/reject', [NursingPharmacyClinicalLogbookController::class, 'reject'])
            ->name('nursing-pharmacy.clinical-logbooks.reject');
        Route::post('/{clinicalLogbook}/lock', [NursingPharmacyClinicalLogbookController::class, 'lock'])
            ->name('nursing-pharmacy.clinical-logbooks.lock');
    });

    // ==================== LAB PRACTICALS ====================
    Route::prefix('lab-practicals')->group(function () {
        // List and create practicals
        Route::get('/', [NursingPharmacyLabPracticalController::class, 'index'])
            ->name('nursing-pharmacy.lab-practicals.index');
        Route::post('/', [NursingPharmacyLabPracticalController::class, 'store'])
            ->name('nursing-pharmacy.lab-practicals.store');

        // Show, update, delete specific practical
        Route::get('/{labPractical}', [NursingPharmacyLabPracticalController::class, 'show'])
            ->name('nursing-pharmacy.lab-practicals.show');
        Route::put('/{labPractical}', [NursingPharmacyLabPracticalController::class, 'update'])
            ->name('nursing-pharmacy.lab-practicals.update');
        Route::delete('/{labPractical}', [NursingPharmacyLabPracticalController::class, 'destroy'])
            ->name('nursing-pharmacy.lab-practicals.destroy');

        // Lab practical management endpoints
        Route::post('/{labPractical}/record-attendance', [NursingPharmacyLabPracticalController::class, 'recordAttendance'])
            ->name('nursing-pharmacy.lab-practicals.record-attendance');
        Route::get('/{labPractical}/attendance-summary', [NursingPharmacyLabPracticalController::class, 'getAttendance'])
            ->name('nursing-pharmacy.lab-practicals.attendance-summary');
        Route::get('/{labPractical}/marks-statistics', [NursingPharmacyLabPracticalController::class, 'getMarkStatistics'])
            ->name('nursing-pharmacy.lab-practicals.marks-statistics');
        Route::post('/{labPractical}/mark-completed', [NursingPharmacyLabPracticalController::class, 'markCompleted'])
            ->name('nursing-pharmacy.lab-practicals.mark-completed');
    });
});
