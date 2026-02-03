<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyCurriculum;
use App\Models\NursingPharmacyProgram;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class NursingPharmacyCurriculumController extends ApiController
{
    /**
     * Get all curriculum entries with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyCurriculum::query();

        // Filter by program
        if ($request->has('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        // Filter by academic year
        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->input('academic_year'));
        }

        // Filter locked/unlocked
        if ($request->has('is_locked')) {
            $query->where('is_locked', $request->boolean('is_locked'));
        }

        $curricula = $query->with(['program', 'subject', 'lockedBy'])
            ->orderBy('academic_year')
            ->orderBy('sequence')
            ->paginate($request->input('per_page', 25));

        return $this->successResponse($curricula, 'Curriculum entries retrieved successfully');
    }

    /**
     * Get a single curriculum entry by ID.
     */
    public function show(NursingPharmacyCurriculum $curriculum): JsonResponse
    {
        $curriculum->load(['program', 'subject', 'lockedBy']);

        return $this->successResponse($curriculum, 'Curriculum entry retrieved successfully');
    }

    /**
     * Create a new curriculum entry.
     */
    public function store(\App\Http\Requests\StoreNursingPharmacyCurriculumRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $curriculum->load(['program', 'subject']);

            return $this->successResponse($curriculum, 'Curriculum entry created successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Update a curriculum entry.
     */
    public function update(Request $request, NursingPharmacyCurriculum $curriculum): JsonResponse
    {
        try {
            // Check if locked
            if ($curriculum->is_locked && !$request->user()?->hasRole('admin')) {
                return $this->errorResponse([], 'This curriculum entry is locked and cannot be modified', 403);
            }

            $validated = $request->validate([
                'sequence' => 'integer|min:1',
                'batch_specific' => 'boolean',
                'notes' => 'nullable|string',
            ]);

            $curriculum->update($validated);
            $curriculum->refresh();

            return $this->successResponse($curriculum, 'Curriculum entry updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Delete a curriculum entry.
     */
    public function destroy(NursingPharmacyCurriculum $curriculum): JsonResponse
    {
        if ($curriculum->is_locked) {
            return $this->errorResponse([], 'Cannot delete a locked curriculum entry', 403);
        }

        $curriculum->delete();

        return $this->successResponse(null, 'Curriculum entry deleted successfully');
    }

    /**
     * Lock a curriculum entry.
     */
    public function lock(Request $request, NursingPharmacyCurriculum $curriculum): JsonResponse
    {
        if ($curriculum->lock($request->user()->id)) {
            return $this->successResponse($curriculum, 'Curriculum entry locked successfully');
        }

        return $this->errorResponse([], 'Curriculum entry is already locked', 400);
    }

    /**
     * Unlock a curriculum entry.
     */
    public function unlock(NursingPharmacyCurriculum $curriculum): JsonResponse
    {
        if ($curriculum->unlock()) {
            return $this->successResponse($curriculum, 'Curriculum entry unlocked successfully');
        }

        return $this->errorResponse([], 'Curriculum entry is not locked', 400);
    }

    /**
     * Get curriculum for a program and academic year.
     */
    public function byProgramAndYear(NursingPharmacyProgram $program, Request $request): JsonResponse
    {
        $academicYear = $request->input('academic_year', 1);

        $curricula = NursingPharmacyCurriculum::forAcademicYear($program->id, $academicYear);

        return $this->successResponse($curricula, 'Program curriculum retrieved successfully');
    }

    /**
     * Get all academic years for a program.
     */
    public function years(NursingPharmacyProgram $program): JsonResponse
    {
        $years = NursingPharmacyCurriculum::getYears($program->id);

        return $this->successResponse(['years' => $years], 'Program academic years retrieved successfully');
    }

    /**
     * Lock all curriculum entries for a program and year.
     */
    public function lockYear(Request $request, NursingPharmacyProgram $program): JsonResponse
    {
        try {
            $validated = $request->validate([
                'academic_year' => 'required|integer|min:1',
            ]);

            $curricula = NursingPharmacyCurriculum::where('program_id', $program->id)
                ->where('academic_year', $validated['academic_year'])
                ->get();

            foreach ($curricula as $curriculum) {
                $curriculum->lock($request->user()->id);
            }

            return $this->successResponse([
                'locked_count' => count($curricula),
                'academic_year' => $validated['academic_year'],
            ], 'Curriculum locked for academic year');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Bulk import curriculum entries.
     */
    public function bulkImport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'curricula' => 'required|array|min:1',
                'curricula.*.program_id' => 'required|exists:nursing_pharmacy_programs,id',
                'curricula.*.subject_id' => 'required|exists:nursing_pharmacy_subjects,id',
                'curricula.*.academic_year' => 'required|integer|min:1',
                'curricula.*.sequence' => 'required|integer|min:1',
            ]);

            $curricula = [];
            foreach ($validated['curricula'] as $curriculumData) {
                $curriculum = NursingPharmacyCurriculum::create($curriculumData);
                $curricula[] = $curriculum;
            }

            return $this->successResponse($curricula, 'Curriculum entries imported successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }
}
