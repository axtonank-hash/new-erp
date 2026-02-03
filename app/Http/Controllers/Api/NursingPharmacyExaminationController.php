<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyExamination;
use App\Models\NursingPharmacyExamResult;
use App\Models\NursingPharmacyGradeMapping;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyExaminationController extends ApiController
{
    /**
     * List examinations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyExamination::query();

        if ($request->has('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        if ($request->has('exam_type')) {
            $query->where('exam_type', $request->input('exam_type'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from_date')) {
            $query->whereDate('exam_date', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('exam_date', '<=', $request->input('to_date'));
        }

        $examinations = $query->with('program', 'subject')
            ->orderBy('exam_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($examinations, 'Examinations retrieved successfully');
    }

    /**
     * Create examination.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
                'subject_id' => 'required|integer|exists:nursing_pharmacy_subjects,id',
                'semester' => 'required|integer|between:1,8',
                'exam_name' => 'required|string|max:255',
                'exam_type' => 'required|in:internal_theory,internal_practical,university_theory,university_practical,sessional,viva,project_evaluation',
                'exam_date' => 'required|date|after_or_equal:today',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
                'exam_venue' => 'nullable|string|max:255',
                'max_marks' => 'required|integer|min:10|max:500',
                'passing_marks' => 'required|integer|min:1',
                'internal_weight_percentage' => 'integer|min:0|max:100',
                'external_weight_percentage' => 'integer|min:0|max:100',
            ]);

            $exam = NursingPharmacyExamination::create($validated);

            return $this->successResponse($exam, 'Examination created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get examination details.
     */
    public function show(NursingPharmacyExamination $examination): JsonResponse
    {
        $examination->load('program', 'subject', 'results');
        $details = array_merge($examination->toArray(), [
            'statistics' => $examination->getResultStatistics(),
        ]);

        return $this->successResponse($details, 'Examination retrieved successfully');
    }

    /**
     * Update examination.
     */
    public function update(Request $request, NursingPharmacyExamination $examination): JsonResponse
    {
        if ($examination->status === 'completed') {
            return $this->errorResponse('Cannot update completed examination', 400);
        }

        try {
            $validated = $request->validate([
                'exam_name' => 'string|max:255',
                'exam_date' => 'date|after_or_equal:today',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
                'exam_venue' => 'nullable|string|max:255',
                'max_marks' => 'integer|min:10|max:500',
                'passing_marks' => 'integer|min:1',
                'status' => 'in:scheduled,ongoing,completed,cancelled,postponed',
            ]);

            $examination->update($validated);

            return $this->successResponse($examination, 'Examination updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Record exam result.
     */
    public function recordResult(Request $request, NursingPharmacyExamination $examination): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
                'internal_marks' => 'nullable|numeric|min:0',
                'practical_marks' => 'nullable|numeric|min:0',
                'external_marks' => 'nullable|numeric|min:0',
                'result_status' => 'required|in:pass,fail,absent,withheld',
            ]);

            $result = NursingPharmacyExamResult::firstOrCreate([
                'examination_id' => $examination->id,
                'student_profile_id' => $validated['student_profile_id'],
            ]);

            $result->update($validated);
            
            // Calculate total marks
            $result->total_marks = $result->calculateTotalMarks();
            
            // Determine grade
            $gradeMapping = NursingPharmacyGradeMapping::getGradeForPercentage(
                $examination->program_id,
                $result->getPercentage()
            );
            
            if ($gradeMapping) {
                $result->grade = $gradeMapping->grade;
                $result->grade_points = $gradeMapping->grade_points;
            }
            
            $result->save();

            return $this->successResponse($result, 'Exam result recorded successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get exam results.
     */
    public function getResults(NursingPharmacyExamination $examination, Request $request): JsonResponse
    {
        $results = $examination->results()
            ->with('studentProfile')
            ->when($request->has('status'), function ($q) use ($request) {
                $q->where('result_status', $request->input('status'));
            })
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($results, 'Exam results retrieved successfully');
    }

    /**
     * Get exam statistics.
     */
    public function getStatistics(NursingPharmacyExamination $examination): JsonResponse
    {
        $stats = $examination->getResultStatistics();

        return $this->successResponse($stats, 'Exam statistics retrieved successfully');
    }

    /**
     * Mark exam as completed.
     */
    public function markCompleted(NursingPharmacyExamination $examination): JsonResponse
    {
        if ($examination->markCompleted()) {
            return $this->successResponse($examination, 'Examination marked as completed');
        }

        return $this->errorResponse('Failed to mark examination as completed', 400);
    }

    /**
     * Delete examination.
     */
    public function destroy(NursingPharmacyExamination $examination): JsonResponse
    {
        if ($examination->status === 'completed') {
            return $this->errorResponse('Cannot delete completed examination', 400);
        }

        $examination->delete();

        return $this->successResponse(null, 'Examination deleted successfully');
    }
}
