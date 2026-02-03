<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyExamResult;
use App\Models\NursingPharmacyGraceMarksRule;
use App\Models\NursingPharmacyAcademicTranscript;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyResultController extends ApiController
{
    /**
     * Get student results.
     */
    public function getStudentResults($studentId, Request $request): JsonResponse
    {
        $results = NursingPharmacyExamResult::where('student_profile_id', $studentId)
            ->with('examination.subject')
            ->when($request->has('status'), function ($q) use ($request) {
                $q->where('result_status', $request->input('status'));
            })
            ->when($request->has('exam_type'), function ($q) use ($request) {
                $q->whereHas('examination', function ($sq) use ($request) {
                    $sq->where('exam_type', $request->input('exam_type'));
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($results, 'Student results retrieved successfully');
    }

    /**
     * Apply grace marks to result.
     */
    public function applyGraceMarks(Request $request, NursingPharmacyExamResult $result): JsonResponse
    {
        try {
            $validated = $request->validate([
                'grace_marks' => 'required|numeric|min:0|max:10',
                'reason' => 'required|string',
            ]);

            if ($result->isPassed()) {
                return $this->errorResponse('Cannot apply grace marks to passed result', 400);
            }

            if ($result->result->applyGraceMarks($validated['grace_marks'], $validated['reason'])) {
                // Update transcript
                $transcript = NursingPharmacyAcademicTranscript::where('student_profile_id', $result->student_profile_id)->first();
                if ($transcript) {
                    $transcript->updateFromResults();
                }

                return $this->successResponse($result, 'Grace marks applied successfully');
            }

            return $this->errorResponse('Failed to apply grace marks', 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Record supplementary result.
     */
    public function recordSupplementary(Request $request, NursingPharmacyExamResult $result): JsonResponse
    {
        try {
            $validated = $request->validate([
                'marks' => 'required|numeric|min:0',
                'status' => 'required|in:pass,fail,pending',
            ]);

            if ($result->recordSupplementaryResult($validated['marks'], $validated['status'])) {
                // Update transcript
                $transcript = NursingPharmacyAcademicTranscript::where('student_profile_id', $result->student_profile_id)->first();
                if ($transcript) {
                    $transcript->updateFromResults();
                }

                return $this->successResponse($result, 'Supplementary result recorded successfully');
            }

            return $this->errorResponse('Failed to record supplementary result', 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Request result recheck.
     */
    public function requestRecheck(Request $request, NursingPharmacyExamResult $result): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string',
            ]);

            $result->update([
                'remarks' => $validated['reason'],
            ]);

            return $this->successResponse($result, 'Recheck request submitted successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Record recheck result.
     */
    public function recordRecheck(Request $request, NursingPharmacyExamResult $result): JsonResponse
    {
        try {
            $validated = $request->validate([
                'marks' => 'required|numeric|min:0',
            ]);

            if ($result->recordRecheckResult($validated['marks'])) {
                // Update transcript
                $transcript = NursingPharmacyAcademicTranscript::where('student_profile_id', $result->student_profile_id)->first();
                if ($transcript) {
                    $transcript->updateFromResults();
                }

                return $this->successResponse($result, 'Recheck result recorded successfully');
            }

            return $this->errorResponse('Failed to record recheck result', 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get backlog subjects.
     */
    public function getBacklogSubjects($studentId): JsonResponse
    {
        $backlogs = NursingPharmacyExamResult::where('student_profile_id', $studentId)
            ->where('is_backlog', true)
            ->with('examination.subject')
            ->get();

        return $this->successResponse($backlogs, 'Backlog subjects retrieved successfully');
    }

    /**
     * Check eligibility for exam.
     */
    public function checkExamEligibility($studentId, Request $request): JsonResponse
    {
        $exam_id = $request->input('examination_id');
        
        $existingResult = NursingPharmacyExamResult::where('student_profile_id', $studentId)
            ->where('examination_id', $exam_id)
            ->first();

        if ($existingResult && $existingResult->isPassed()) {
            return $this->successResponse([
                'eligible' => false,
                'reason' => 'Student has already passed this exam',
            ], 'Eligibility checked');
        }

        return $this->successResponse([
            'eligible' => true,
            'can_attempt_supplementary' => $existingResult !== null,
        ], 'Student is eligible for exam');
    }
}
