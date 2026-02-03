<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyAcademicTranscript;
use App\Models\NursingPharmacyStudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyTranscriptController extends ApiController
{
    /**
     * Get student academic transcript.
     */
    public function getTranscript($studentId): JsonResponse
    {
        try {
            $transcript = NursingPharmacyAcademicTranscript::where('student_id', $studentId)
                ->with('student', 'program')
                ->first();

            if (!$transcript) {
                return $this->errorResponse('Transcript not found for this student', 404);
            }

            return $this->successResponse($transcript->getFullTranscript(), 'Student transcript retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get transcript summary.
     */
    public function getTranscriptSummary($studentId): JsonResponse
    {
        try {
            $transcript = NursingPharmacyAcademicTranscript::where('student_id', $studentId)->first();

            if (!$transcript) {
                return $this->errorResponse('Transcript not found for this student', 404);
            }

            $summary = [
                'student_id' => $studentId,
                'program_id' => $transcript->program_id,
                'cumulative_gpa' => $transcript->cumulative_gpa,
                'cumulative_percentage' => $transcript->cumulative_percentage,
                'academic_standing' => $transcript->academic_standing,
                'total_credits' => $transcript->total_credits,
                'credits_earned' => $transcript->credits_earned,
                'credits_remaining' => $transcript->total_credits - $transcript->credits_earned,
                'on_deans_list' => $transcript->on_deans_list,
                'last_updated' => $transcript->updated_at,
            ];

            return $this->successResponse($summary, 'Transcript summary retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Check graduation eligibility.
     */
    public function checkGraduationEligibility($studentId): JsonResponse
    {
        try {
            $transcript = NursingPharmacyAcademicTranscript::where('student_id', $studentId)->first();

            if (!$transcript) {
                return $this->errorResponse('Transcript not found for this student', 404);
            }

            $student = NursingPharmacyStudentProfile::find($studentId);
            if (!$student) {
                return $this->errorResponse('Student not found', 404);
            }

            $eligibility = [
                'student_id' => $studentId,
                'is_eligible' => $transcript->isEligibleForGraduation(),
                'cumulative_gpa' => $transcript->cumulative_gpa,
                'minimum_gpa_required' => 1.0,
                'gpa_compliant' => $transcript->cumulative_gpa >= 1.0,
                'total_credits_required' => $transcript->total_credits,
                'credits_earned' => $transcript->credits_earned,
                'credits_compliant' => $transcript->credits_earned >= $transcript->total_credits,
                'academic_standing' => $transcript->academic_standing,
                'standing_compliant' => !in_array($transcript->academic_standing, ['probation', 'terminated']),
                'notes' => $this->getEligibilityNotes($transcript),
            ];

            return $this->successResponse($eligibility, 'Graduation eligibility checked successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get student academic performance.
     */
    public function getAcademicPerformance($studentId, Request $request): JsonResponse
    {
        try {
            $transcript = NursingPharmacyAcademicTranscript::where('student_id', $studentId)->first();

            if (!$transcript) {
                return $this->errorResponse('Transcript not found for this student', 404);
            }

            $semester = $request->input('semester');

            $performance = [
                'overall_metrics' => [
                    'cumulative_gpa' => $transcript->cumulative_gpa,
                    'cumulative_percentage' => $transcript->cumulative_percentage,
                    'academic_standing' => $transcript->academic_standing,
                    'on_deans_list' => $transcript->on_deans_list,
                    'on_academic_probation' => $transcript->academic_standing === 'probation',
                ],
                'semester_breakdown' => $this->getSemesterBreakdown($studentId, $semester),
                'subject_performance' => $this->getSubjectPerformance($studentId, $semester),
            ];

            return $this->successResponse($performance, 'Academic performance retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Generate program compliance report.
     */
    public function generateProgramComplianceReport($programId): JsonResponse
    {
        try {
            $transcripts = NursingPharmacyAcademicTranscript::where('program_id', $programId)
                ->get();

            if ($transcripts->isEmpty()) {
                return $this->errorResponse('No transcripts found for this program', 404);
            }

            $totalStudents = $transcripts->count();
            $excellentCount = $transcripts->where('academic_standing', 'excellent')->count();
            $goodCount = $transcripts->where('academic_standing', 'good')->count();
            $satisfactoryCount = $transcripts->where('academic_standing', 'satisfactory')->count();
            $poorCount = $transcripts->where('academic_standing', 'poor')->count();
            $probationCount = $transcripts->where('academic_standing', 'probation')->count();
            $deansListCount = $transcripts->where('on_deans_list', true)->count();
            $averageGpa = $transcripts->avg('cumulative_gpa');
            $averagePercentage = $transcripts->avg('cumulative_percentage');

            $report = [
                'program_id' => $programId,
                'total_students' => $totalStudents,
                'academic_standing_distribution' => [
                    'excellent' => ['count' => $excellentCount, 'percentage' => ($excellentCount / $totalStudents) * 100],
                    'good' => ['count' => $goodCount, 'percentage' => ($goodCount / $totalStudents) * 100],
                    'satisfactory' => ['count' => $satisfactoryCount, 'percentage' => ($satisfactoryCount / $totalStudents) * 100],
                    'poor' => ['count' => $poorCount, 'percentage' => ($poorCount / $totalStudents) * 100],
                    'probation' => ['count' => $probationCount, 'percentage' => ($probationCount / $totalStudents) * 100],
                ],
                'deans_list_students' => $deansListCount,
                'performance_metrics' => [
                    'average_gpa' => round($averageGpa, 2),
                    'average_percentage' => round($averagePercentage, 2),
                    'highest_gpa' => $transcripts->max('cumulative_gpa'),
                    'lowest_gpa' => $transcripts->min('cumulative_gpa'),
                ],
                'report_generated_at' => now(),
            ];

            return $this->successResponse($report, 'Program compliance report generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Export transcript.
     */
    public function exportTranscript($studentId, Request $request): JsonResponse
    {
        try {
            $format = $request->input('format', 'json');
            $transcript = NursingPharmacyAcademicTranscript::where('student_id', $studentId)
                ->with('student', 'program')
                ->first();

            if (!$transcript) {
                return $this->errorResponse('Transcript not found for this student', 404);
            }

            $data = $transcript->getFullTranscript();

            if ($format === 'pdf') {
                return $this->successResponse([
                    'format' => 'pdf',
                    'download_url' => route('transcript.download', ['student_id' => $studentId, 'format' => 'pdf']),
                    'message' => 'PDF export URL generated',
                ], 'Transcript export prepared successfully');
            } elseif ($format === 'excel') {
                return $this->successResponse([
                    'format' => 'excel',
                    'download_url' => route('transcript.download', ['student_id' => $studentId, 'format' => 'excel']),
                    'message' => 'Excel export URL generated',
                ], 'Transcript export prepared successfully');
            }

            return $this->successResponse($data, 'Transcript exported successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get semester breakdown.
     */
    private function getSemesterBreakdown($studentId, $semester = null)
    {
        // This would fetch from exam results grouped by semester
        return [];
    }

    /**
     * Get subject performance.
     */
    private function getSubjectPerformance($studentId, $semester = null)
    {
        // This would fetch exam results with subject-wise breakdown
        return [];
    }

    /**
     * Get eligibility notes.
     */
    private function getEligibilityNotes($transcript): array
    {
        $notes = [];

        if ($transcript->cumulative_gpa < 1.0) {
            $notes[] = 'GPA below minimum required';
        }

        if ($transcript->credits_earned < $transcript->total_credits) {
            $notes[] = 'Credits not completed - ' . ($transcript->total_credits - $transcript->credits_earned) . ' remaining';
        }

        if ($transcript->academic_standing === 'probation') {
            $notes[] = 'Student is on academic probation';
        }

        if ($transcript->academic_standing === 'terminated') {
            $notes[] = 'Student academic standing is terminated';
        }

        return $notes;
    }
}
