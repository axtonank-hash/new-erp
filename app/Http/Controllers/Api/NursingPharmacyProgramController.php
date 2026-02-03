<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyProgram;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class NursingPharmacyProgramController extends ApiController
{
    /**
     * Get all programs with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyProgram::query();

        // Filter by type (nursing/pharmacy)
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by regulatory body
        if ($request->has('regulatory_body')) {
            $query->where('regulatory_body', $request->input('regulatory_body'));
        }

        // Filter active/inactive
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or program_type
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('program_type', 'like', "%{$search}%");
            });
        }

        $programs = $query->with(['subjects', 'curricula'])
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($programs, 'Programs retrieved successfully');
    }

    /**
     * Get a single program by ID.
     */
    public function show(NursingPharmacyProgram $program): JsonResponse
    {
        $program->load(['subjects', 'curricula']);

        return $this->successResponse($program, 'Program retrieved successfully');
    }

    /**
     * Create a new program.
     */
    public function store(\App\Http\Requests\StoreNursingPharmacyProgramRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $program = NursingPharmacyProgram::create($validated);

            // Validate compliance if needed
            if ($program->type === 'nursing') {
                $errors = $program->validateINCCompliance();
                if (!empty($errors)) {
                    return $this->errorResponse($errors, 'Program created but has compliance issues', 201);
                }
            } elseif ($program->type === 'pharmacy') {
                $errors = $program->validatePCICompliance();
                if (!empty($errors)) {
                    return $this->errorResponse($errors, 'Program created but has compliance issues', 201);
                }
            }

            return $this->successResponse($program, 'Program created successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Update a program.
     */
    public function update(Request $request, NursingPharmacyProgram $program): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'string|max:255',
                'type' => 'in:nursing,pharmacy',
                'program_type' => 'string|max:100',
                'duration_years' => 'integer|min:1|max:10',
                'duration_months' => 'integer|min:0|max:11',
                'total_intake_limit' => 'integer|min:1',
                'starting_semester' => 'integer|min:1|max:8',
                'clinical_hours_required' => 'nullable|integer|min:0',
                'theory_hours_required' => 'nullable|integer|min:0',
                'regulatory_body' => 'in:INC,PCI,UNIVERSITY',
                'is_active' => 'boolean',
                'description' => 'nullable|string',
            ]);

            $program->update($validated);
            $program->refresh();

            return $this->successResponse($program, 'Program updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Delete a program.
     */
    public function destroy(NursingPharmacyProgram $program): JsonResponse
    {
        $program->delete();

        return $this->successResponse(null, 'Program deleted successfully');
    }

    /**
     * Get compliance report for a program.
     */
    public function complianceReport(NursingPharmacyProgram $program): JsonResponse
    {
        $report = $program->getComplianceReport();

        return $this->successResponse($report, 'Compliance report retrieved successfully');
    }

    /**
     * Get all subjects for a program.
     */
    public function subjects(NursingPharmacyProgram $program): JsonResponse
    {
        $subjects = $program->subjects()
            ->orderBy('semester')
            ->orderBy('name')
            ->get();

        return $this->successResponse($subjects, 'Program subjects retrieved successfully');
    }

    /**
     * Get curriculum for a program and academic year.
     */
    public function curriculum(Request $request, NursingPharmacyProgram $program): JsonResponse
    {
        $academicYear = $request->input('academic_year', 1);

        $curriculum = $program->curricula()
            ->where('academic_year', $academicYear)
            ->with('subject')
            ->orderBy('sequence')
            ->get();

        return $this->successResponse($curriculum, 'Program curriculum retrieved successfully');
    }

    /**
     * Bulk import programs.
     */
    public function bulkImport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'programs' => 'required|array|min:1',
                'programs.*.name' => 'required|string|max:255',
                'programs.*.type' => 'required|in:nursing,pharmacy',
                'programs.*.program_type' => 'required|string|max:100',
                'programs.*.duration_years' => 'required|integer|min:1',
                'programs.*.total_intake_limit' => 'required|integer|min:1',
                'programs.*.regulatory_body' => 'required|in:INC,PCI,UNIVERSITY',
            ]);

            $programs = [];
            foreach ($validated['programs'] as $programData) {
                $program = NursingPharmacyProgram::create($programData);
                $programs[] = $program;
            }

            return $this->successResponse($programs, 'Programs imported successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }
}
