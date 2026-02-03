<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyStudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyStudentProfileController extends ApiController
{
    /**
     * Get student profile.
     */
    public function show(Request $request): JsonResponse
    {
        $studentId = $request->user()->id ?? $request->input('student_id');

        $profile = NursingPharmacyStudentProfile::where('student_id', $studentId)
            ->with(['student', 'program', 'currentHospital', 'currentDepartment', 'clinicalPostings'])
            ->first();

        if (!$profile) {
            return $this->notFound('Student profile not found');
        }

        return $this->successResponse($profile, 'Student profile retrieved successfully');
    }

    /**
     * Create or update student profile.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:users,id|unique:nursing_pharmacy_student_profiles,student_id',
                'program_id' => 'required|exists:nursing_pharmacy_programs,id',
                'registration_number' => 'nullable|string|unique:nursing_pharmacy_student_profiles',
                'inc_registration_number' => 'nullable|string|unique:nursing_pharmacy_student_profiles',
                'pci_registration_number' => 'nullable|string|unique:nursing_pharmacy_student_profiles',
                'project_title' => 'nullable|string|max:255',
                'dissertation_link' => 'nullable|url',
            ]);

            $profile = NursingPharmacyStudentProfile::create($validated);
            $profile->load(['student', 'program']);

            return $this->successResponse($profile, 'Student profile created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Update student profile.
     */
    public function update(Request $request, NursingPharmacyStudentProfile $profile): JsonResponse
    {
        try {
            $validated = $request->validate([
                'clinical_hours_completed' => 'integer|min:0',
                'lab_practical_hours' => 'integer|min:0',
                'industrial_training_hours' => 'integer|min:0',
                'industrial_training_status' => 'in:not_started,in_progress,completed,pending_approval',
                'project_status' => 'in:not_started,in_progress,submitted,approved,rejected',
                'project_title' => 'nullable|string|max:255',
                'dissertation_link' => 'nullable|url',
                'clinical_summary' => 'nullable|string',
                'current_hospital_id' => 'nullable|exists:nursing_pharmacy_hospitals,id',
                'current_department_id' => 'nullable|exists:nursing_pharmacy_departments,id',
            ]);

            $profile->update($validated);
            $profile->refresh();

            return $this->successResponse($profile, 'Student profile updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Check exam eligibility.
     */
    public function checkEligibility(NursingPharmacyStudentProfile $profile): JsonResponse
    {
        $report = $profile->getEligibilityReport();

        return $this->successResponse($report, 'Eligibility check completed');
    }

    /**
     * Mark as eligible for exam.
     */
    public function markEligible(NursingPharmacyStudentProfile $profile): JsonResponse
    {
        $result = $profile->markEligibleForExam();

        if ($result) {
            return $this->successResponse(
                ['eligible' => true],
                'Student marked as eligible for exam'
            );
        }

        return $this->errorResponse(
            ['eligible' => false, 'errors' => $profile->eligibility_notes],
            'Student does not meet eligibility requirements',
            422
        );
    }

    /**
     * Get progress metrics.
     */
    public function getProgress(NursingPharmacyStudentProfile $profile): JsonResponse
    {
        $metrics = $profile->getProgressMetrics();

        return $this->successResponse($metrics, 'Progress metrics retrieved successfully');
    }

    /**
     * Get clinical postings.
     */
    public function getClinicalPostings(NursingPharmacyStudentProfile $profile): JsonResponse
    {
        $postings = $profile->clinicalPostings()
            ->with(['hospital', 'department', 'supervisor'])
            ->orderByDesc('start_date')
            ->get()
            ->map(function ($posting) {
                return $posting->getSummary();
            });

        return $this->successResponse($postings, 'Clinical postings retrieved successfully');
    }

    /**
     * Get documents.
     */
    public function getDocuments(NursingPharmacyStudentProfile $profile): JsonResponse
    {
        $documents = $profile->documents()
            ->where('is_latest', true)
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($doc) {
                return $doc->getPreviewInfo();
            });

        return $this->successResponse($documents, 'Student documents retrieved successfully');
    }

    /**
     * Get student list by program.
     */
    public function listByProgram(Request $request): JsonResponse
    {
        $programId = $request->input('program_id');
        $query = NursingPharmacyStudentProfile::where('program_id', $programId)
            ->with(['student', 'program']);

        // Filter by eligibility status
        if ($request->has('eligible')) {
            $query->where('eligible_for_exam', $request->boolean('eligible'));
        }

        $profiles = $query->paginate($request->input('per_page', 20));

        return $this->successResponse($profiles, 'Student profiles retrieved successfully');
    }

    /**
     * Get student eligibility summary for program.
     */
    public function getEligibilitySummary(Request $request): JsonResponse
    {
        $programId = $request->input('program_id');

        $profiles = NursingPharmacyStudentProfile::where('program_id', $programId)
            ->select('id', 'student_id', 'eligible_for_exam', 'eligibility_notes')
            ->get();

        $summary = [
            'total_students' => $profiles->count(),
            'eligible' => $profiles->where('eligible_for_exam', true)->count(),
            'not_eligible' => $profiles->where('eligible_for_exam', false)->count(),
            'pending_check' => $profiles->where('eligibility_check_date', null)->count(),
            'details' => $profiles->map(function ($p) {
                return [
                    'student_id' => $p->student_id,
                    'status' => $p->eligible_for_exam ? 'eligible' : 'not_eligible',
                    'notes' => $p->eligibility_notes,
                ];
            }),
        ];

        return $this->successResponse($summary, 'Eligibility summary retrieved successfully');
    }
}
