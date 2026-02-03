<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyClinicalLogbook;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyClinicalLogbookController extends ApiController
{
    /**
     * List clinical logbooks.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyClinicalLogbook::query();

        // Filter by student
        if ($request->has('student_profile_id')) {
            $query->where('student_profile_id', $request->input('student_profile_id'));
        }

        // Filter by posting
        if ($request->has('clinical_posting_id')) {
            $query->where('clinical_posting_id', $request->input('clinical_posting_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Date range
        if ($request->has('from_date')) {
            $query->whereDate('entry_date', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('entry_date', '<=', $request->input('to_date'));
        }

        $logbooks = $query->with('studentProfile', 'clinicalPosting', 'supervisor')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($logbooks, 'Clinical logbooks retrieved successfully');
    }

    /**
     * Create logbook entry.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
                'clinical_posting_id' => 'required|integer|exists:nursing_pharmacy_clinical_postings,id',
                'entry_date' => 'required|date|before_or_equal:today',
                'procedure_name' => 'required|string|max:255',
                'procedure_description' => 'required|string',
                'ward' => 'nullable|string|max:100',
                'patient_category' => 'nullable|string|max:100',
                'competencies_checklist' => 'nullable|json',
                'observations' => 'required|string',
                'learning_points' => 'nullable|string',
                'challenges' => 'nullable|string',
                'achievements' => 'nullable|string',
            ]);

            // Initialize competencies if provided
            if (isset($validated['competencies_checklist'])) {
                $checklist = $validated['competencies_checklist'];
                $validated['competencies_total'] = count($checklist);
                $validated['competencies_completed'] = array_sum(array_column($checklist, 'status') === 'completed' ? 1 : 0);
            }

            $logbook = NursingPharmacyClinicalLogbook::create($validated);

            return $this->successResponse($logbook, 'Clinical logbook entry created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get logbook entry.
     */
    public function show(NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        $logbook->load('studentProfile', 'clinicalPosting', 'supervisor');
        $summary = array_merge($logbook->toArray(), [
            'competency_completion' => $logbook->getCompletionPercentage(),
            'summary' => $logbook->getSummary(),
        ]);

        return $this->successResponse($summary, 'Clinical logbook retrieved successfully');
    }

    /**
     * Update logbook entry.
     */
    public function update(Request $request, NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        if ($logbook->is_locked) {
            return $this->errorResponse('Cannot update locked logbook entry', 400);
        }

        try {
            $validated = $request->validate([
                'procedure_description' => 'string',
                'competencies_checklist' => 'nullable|json',
                'observations' => 'string',
                'learning_points' => 'nullable|string',
                'challenges' => 'nullable|string',
                'achievements' => 'nullable|string',
            ]);

            $logbook->update($validated);
            if (isset($validated['competencies_checklist'])) {
                $logbook->updateCompetencyStatus();
            }

            return $this->successResponse($logbook, 'Clinical logbook updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Submit logbook entry.
     */
    public function submit(NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        if ($logbook->is_locked) {
            return $this->errorResponse('This entry is already locked', 400);
        }

        if ($logbook->submit()) {
            return $this->successResponse($logbook, 'Logbook entry submitted successfully');
        }

        return $this->errorResponse('Failed to submit logbook entry', 400);
    }

    /**
     * Approve logbook entry.
     */
    public function approve(Request $request, NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        try {
            $validated = $request->validate([
                'feedback' => 'nullable|string',
                'rating' => 'required|in:excellent,good,satisfactory,needs_improvement',
                'auto_lock' => 'boolean',
            ]);

            if ($logbook->approve(auth()->id(), $validated['feedback'] ?? null)) {
                if ($validated['auto_lock'] ?? false) {
                    $logbook->lock();
                }
                return $this->successResponse($logbook, 'Logbook entry approved successfully');
            }

            return $this->errorResponse('Failed to approve logbook entry', 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Reject logbook entry.
     */
    public function reject(Request $request, NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        try {
            $validated = $request->validate([
                'rejection_reason' => 'required|string',
            ]);

            if ($logbook->reject($validated['rejection_reason'])) {
                return $this->successResponse($logbook, 'Logbook entry rejected successfully');
            }

            return $this->errorResponse('Failed to reject logbook entry', 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Lock logbook entry.
     */
    public function lock(NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        if ($logbook->lock()) {
            return $this->successResponse($logbook, 'Logbook entry locked successfully');
        }

        return $this->errorResponse('Entry must be approved before locking', 400);
    }

    /**
     * Delete logbook entry.
     */
    public function destroy(NursingPharmacyClinicalLogbook $logbook): JsonResponse
    {
        if ($logbook->is_locked) {
            return $this->errorResponse('Cannot delete locked logbook entry', 400);
        }

        $logbook->delete();

        return $this->successResponse(null, 'Logbook entry deleted successfully');
    }
}
