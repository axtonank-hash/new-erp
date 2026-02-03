<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacySubject;
use App\Models\NursingPharmacyProgram;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class NursingPharmacySubjectController extends ApiController
{
    /**
     * Get all subjects with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacySubject::query();

        // Filter by program
        if ($request->has('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        // Filter by semester
        if ($request->has('semester')) {
            $query->where('semester', $request->input('semester'));
        }

        // Filter by regulatory body
        if ($request->has('regulatory_body')) {
            $query->where('regulatory_body', $request->input('regulatory_body'));
        }

        // Filter mandatory subjects only
        if ($request->has('is_mandatory')) {
            $query->where('is_mandatory', $request->boolean('is_mandatory'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $subjects = $query->with('program')
            ->orderBy('semester')
            ->orderBy('name')
            ->paginate($request->input('per_page', 20));

        return $this->successResponse($subjects, 'Subjects retrieved successfully');
    }

    /**
     * Get a single subject by ID.
     */
    public function show(NursingPharmacySubject $subject): JsonResponse
    {
        $subject->load('program', 'curriculumEntries');

        return $this->successResponse($subject, 'Subject retrieved successfully');
    }

    /**
     * Create a new subject.
     */
    public function store(\App\Http\Requests\StoreNursingPharmacySubjectRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $subject = NursingPharmacySubject::create($validated);

            // Validate compliance
            $practicalTheoryErrors = $subject->validatePracticalTheoryRatio();
            $creditHoursErrors = $subject->validateCreditHours();

            $allErrors = array_merge($practicalTheoryErrors, $creditHoursErrors);
            if (!empty($allErrors)) {
                return $this->errorResponse($allErrors, 'Subject created but has validation issues', 201);
            }

            return $this->successResponse($subject, 'Subject created successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Update a subject.
     */
    public function update(Request $request, NursingPharmacySubject $subject): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'string|max:255',
                'code' => 'string|max:50|unique:nursing_pharmacy_subjects,code,' . $subject->id,
                'semester' => 'integer|min:1|max:12',
                'credit_hours' => 'nullable|integer|min:0',
                'theory_hours' => 'integer|min:0',
                'practical_hours' => 'integer|min:0',
                'is_mandatory' => 'boolean',
                'regulatory_body' => 'in:INC,PCI,UNIVERSITY',
                'description' => 'nullable|string',
            ]);

            $subject->update($validated);
            $subject->refresh();

            return $this->successResponse($subject, 'Subject updated successfully');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }

    /**
     * Delete a subject.
     */
    public function destroy(NursingPharmacySubject $subject): JsonResponse
    {
        $subject->delete();

        return $this->successResponse(null, 'Subject deleted successfully');
    }

    /**
     * Get validation report for a subject.
     */
    public function validationReport(NursingPharmacySubject $subject): JsonResponse
    {
        $report = $subject->getValidationReport();

        return $this->successResponse($report, 'Subject validation report retrieved successfully');
    }

    /**
     * Get subjects by program.
     */
    public function byProgram(NursingPharmacyProgram $program, Request $request): JsonResponse
    {
        $semester = $request->input('semester');

        $subjects = $program->subjects();

        if ($semester) {
            $subjects->where('semester', $semester);
        }

        $subjects = $subjects->orderBy('semester')
            ->orderBy('name')
            ->get();

        return $this->successResponse($subjects, 'Program subjects retrieved successfully');
    }

    /**
     * Validate all subjects for a program.
     */
    public function validateProgram(NursingPharmacyProgram $program): JsonResponse
    {
        $subjects = $program->subjects()->get();
        $validationReports = [];

        foreach ($subjects as $subject) {
            $validationReports[] = $subject->getValidationReport();
        }

        $hasErrors = collect($validationReports)->some(function ($report) {
            return !empty($report['practical_theory_errors']) || !empty($report['credit_hours_errors']);
        });

        return $this->successResponse([
            'program_id' => $program->id,
            'total_subjects' => count($validationReports),
            'has_errors' => $hasErrors,
            'subjects' => $validationReports,
        ], 'Program subjects validation completed');
    }

    /**
     * Bulk import subjects.
     */
    public function bulkImport(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'subjects' => 'required|array|min:1',
                'subjects.*.program_id' => 'required|exists:nursing_pharmacy_programs,id',
                'subjects.*.name' => 'required|string|max:255',
                'subjects.*.code' => 'required|string|max:50|unique:nursing_pharmacy_subjects',
                'subjects.*.semester' => 'required|integer|min:1|max:12',
                'subjects.*.theory_hours' => 'required|integer|min:0',
                'subjects.*.practical_hours' => 'required|integer|min:0',
                'subjects.*.regulatory_body' => 'required|in:INC,PCI,UNIVERSITY',
            ]);

            $subjects = [];
            foreach ($validated['subjects'] as $subjectData) {
                $subject = NursingPharmacySubject::create($subjectData);
                $subjects[] = $subject;
            }

            return $this->successResponse($subjects, 'Subjects imported successfully', 201);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->errors(), 'Validation failed', 422);
        }
    }
}
