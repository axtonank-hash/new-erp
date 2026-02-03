<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NursingPharmacyExaminationController;
use App\Http\Controllers\Api\NursingPharmacyResultController;
use App\Http\Controllers\Api\NursingPharmacyComplianceController;
use App\Http\Controllers\Api\NursingPharmacyTranscriptController;

/**
 * Phase 4: Examination & Compliance System Routes
 * Base: /api/v4/nursing-pharmacy
 * Authentication: Sanctum middleware required
 */

Route::middleware(['auth:sanctum'])->group(function () {
    
    // ==================== EXAMINATION MANAGEMENT ====================
    
    Route::prefix('examinations')->group(function () {
        // List all examinations
        Route::get('/', [NursingPharmacyExaminationController::class, 'list'])->name('examination.list');
        
        // Create new examination
        Route::post('/', [NursingPharmacyExaminationController::class, 'store'])->name('examination.store');
        
        // Get examination details
        Route::get('/{examination}', [NursingPharmacyExaminationController::class, 'show'])->name('examination.show');
        
        // Update examination
        Route::put('/{examination}', [NursingPharmacyExaminationController::class, 'update'])->name('examination.update');
        
        // Delete examination
        Route::delete('/{examination}', [NursingPharmacyExaminationController::class, 'destroy'])->name('examination.destroy');
        
        // Get examination statistics
        Route::get('/{examination}/statistics', [NursingPharmacyExaminationController::class, 'getStatistics'])->name('examination.statistics');
        
        // Cancel examination
        Route::post('/{examination}/cancel', [NursingPharmacyExaminationController::class, 'cancel'])->name('examination.cancel');
        
        // Publish examination results
        Route::post('/{examination}/publish-results', [NursingPharmacyExaminationController::class, 'publishResults'])->name('examination.publish-results');
        
        // Get examination results
        Route::get('/{examination}/results', [NursingPharmacyExaminationController::class, 'getResults'])->name('examination.results');
    });
    
    // ==================== RESULT MANAGEMENT ====================
    
    Route::prefix('results')->group(function () {
        // Get student results
        Route::get('/student/{studentId}', [NursingPharmacyResultController::class, 'getStudentResults'])->name('result.student');
        
        // Create exam result (record marks)
        Route::post('/', [NursingPharmacyResultController::class, 'store'])->name('result.store');
        
        // Get result details
        Route::get('/{result}', [NursingPharmacyResultController::class, 'show'])->name('result.show');
        
        // Update result
        Route::put('/{result}', [NursingPharmacyResultController::class, 'update'])->name('result.update');
        
        // Apply grace marks
        Route::post('/{result}/apply-grace-marks', [NursingPharmacyResultController::class, 'applyGraceMarks'])->name('result.grace-marks');
        
        // Record supplementary exam result
        Route::post('/{result}/supplementary', [NursingPharmacyResultController::class, 'recordSupplementary'])->name('result.supplementary');
        
        // Request result recheck
        Route::post('/{result}/request-recheck', [NursingPharmacyResultController::class, 'requestRecheck'])->name('result.request-recheck');
        
        // Record recheck result
        Route::post('/{result}/record-recheck', [NursingPharmacyResultController::class, 'recordRecheck'])->name('result.record-recheck');
        
        // Get backlog subjects
        Route::get('/student/{studentId}/backlog-subjects', [NursingPharmacyResultController::class, 'getBacklogSubjects'])->name('result.backlog');
        
        // Check exam eligibility
        Route::get('/student/{studentId}/eligibility', [NursingPharmacyResultController::class, 'checkExamEligibility'])->name('result.eligibility');
    });
    
    // ==================== ACADEMIC TRANSCRIPT ====================
    
    Route::prefix('transcripts')->group(function () {
        // Get student transcript
        Route::get('/student/{studentId}', [NursingPharmacyTranscriptController::class, 'getTranscript'])->name('transcript.student');
        
        // Get transcript summary
        Route::get('/student/{studentId}/summary', [NursingPharmacyTranscriptController::class, 'getTranscriptSummary'])->name('transcript.summary');
        
        // Check graduation eligibility
        Route::get('/student/{studentId}/graduation-eligibility', [NursingPharmacyTranscriptController::class, 'checkGraduationEligibility'])->name('transcript.graduation-eligibility');
        
        // Get academic performance
        Route::get('/student/{studentId}/performance', [NursingPharmacyTranscriptController::class, 'getAcademicPerformance'])->name('transcript.performance');
        
        // Export transcript
        Route::get('/student/{studentId}/export', [NursingPharmacyTranscriptController::class, 'exportTranscript'])->name('transcript.export');
    });
    
    // ==================== COMPLIANCE & AUDITING ====================
    
    Route::prefix('compliance')->group(function () {
        // List compliance audits
        Route::get('/audits', [NursingPharmacyComplianceController::class, 'listAudits'])->name('compliance.audits.list');
        
        // Create compliance audit
        Route::post('/audits', [NursingPharmacyComplianceController::class, 'createAudit'])->name('compliance.audits.store');
        
        // Get audit details
        Route::get('/audits/{audit}', [NursingPharmacyComplianceController::class, 'getAudit'])->name('compliance.audits.show');
        
        // Update audit with corrective actions
        Route::put('/audits/{audit}', [NursingPharmacyComplianceController::class, 'updateAudit'])->name('compliance.audits.update');
        
        // Record corrective action completion
        Route::post('/audits/{audit}/record-correction', [NursingPharmacyComplianceController::class, 'recordCorrectionCompletion'])->name('compliance.audits.record-correction');
        
        // Get compliance matrix
        Route::get('/matrix/{programId}', [NursingPharmacyComplianceController::class, 'getComplianceMatrix'])->name('compliance.matrix');
        
        // Generate compliance report
        Route::get('/report/{programId}', [NursingPharmacyComplianceController::class, 'generateComplianceReport'])->name('compliance.report');
        
        // Export compliance checklist
        Route::get('/checklist/{programId}', [NursingPharmacyComplianceController::class, 'exportChecklist'])->name('compliance.checklist');
        
        // Generate program compliance report
        Route::get('/program-report/{programId}', [NursingPharmacyTranscriptController::class, 'generateProgramComplianceReport'])->name('compliance.program-report');
    });
    
    // ==================== REPORTS & ANALYTICS ====================
    
    Route::prefix('reports')->group(function () {
        // Examination performance report
        Route::get('/examination-performance/{programId}', function ($programId) {
            return response()->json(['message' => 'Examination performance report endpoint']);
        })->name('report.examination-performance');
        
        // Student performance distribution
        Route::get('/student-performance/{programId}', function ($programId) {
            return response()->json(['message' => 'Student performance distribution endpoint']);
        })->name('report.student-performance');
        
        // Subject-wise analysis
        Route::get('/subject-analysis/{programId}', function ($programId) {
            return response()->json(['message' => 'Subject-wise analysis endpoint']);
        })->name('report.subject-analysis');
        
        // Grade distribution report
        Route::get('/grade-distribution/{programId}', function ($programId) {
            return response()->json(['message' => 'Grade distribution endpoint']);
        })->name('report.grade-distribution');
    });
});
