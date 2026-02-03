<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyFaculty;
use App\Models\NursingPharmacyFacultySubject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyFacultyController extends ApiController
{
    /**
     * List faculty members.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyFaculty::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->input('department'));
        }

        // Filter by faculty type
        if ($request->has('faculty_type')) {
            $query->where('faculty_type', $request->input('faculty_type'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('faculty_code', 'like', "%{$search}%");
        }

        $faculty = $query->with('user', 'subjects')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($faculty, 'Faculty members retrieved successfully');
    }

    /**
     * Get faculty details.
     */
    public function show(NursingPharmacyFaculty $faculty): JsonResponse
    {
        $faculty->load('user', 'subjects.subject');
        $detailedInfo = array_merge($faculty->toArray(), $faculty->getAvailabilityInfo());

        return $this->successResponse($detailedInfo, 'Faculty details retrieved successfully');
    }

    /**
     * Create faculty member.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id|unique:nursing_pharmacy_faculty',
                'faculty_code' => 'required|string|max:50|unique:nursing_pharmacy_faculty',
                'highest_qualification' => 'required|string|max:100',
                'specialty' => 'nullable|string|max:255',
                'sub_specialty' => 'nullable|string|max:255',
                'inc_registration_no' => 'nullable|string|max:100|unique:nursing_pharmacy_faculty',
                'pci_registration_no' => 'nullable|string|max:100|unique:nursing_pharmacy_faculty',
                'registration_expiry_date' => 'nullable|date|after:today',
                'clinical_eligible' => 'boolean',
                'lab_supervision_eligible' => 'boolean',
                'theory_eligible' => 'boolean',
                'faculty_type' => 'required|in:permanent,contractual,visiting,guest',
                'department' => 'required|in:nursing,pharmacy,both',
                'max_student_load' => 'integer|min:10|max:100',
                'research_publications' => 'integer|min:0',
                'has_phd' => 'boolean',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'address' => 'nullable|string',
                'joining_date' => 'required|date|before_or_equal:today',
            ]);

            $faculty = NursingPharmacyFaculty::create($validated);

            return $this->successResponse($faculty, 'Faculty member created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Update faculty member.
     */
    public function update(Request $request, NursingPharmacyFaculty $faculty): JsonResponse
    {
        try {
            $validated = $request->validate([
                'faculty_code' => 'string|max:50|unique:nursing_pharmacy_faculty,faculty_code,' . $faculty->id,
                'highest_qualification' => 'string|max:100',
                'specialty' => 'nullable|string|max:255',
                'sub_specialty' => 'nullable|string|max:255',
                'inc_registration_no' => 'nullable|string|max:100|unique:nursing_pharmacy_faculty,inc_registration_no,' . $faculty->id,
                'pci_registration_no' => 'nullable|string|max:100|unique:nursing_pharmacy_faculty,pci_registration_no,' . $faculty->id,
                'clinical_eligible' => 'boolean',
                'lab_supervision_eligible' => 'boolean',
                'theory_eligible' => 'boolean',
                'max_student_load' => 'integer|min:10|max:100',
                'research_publications' => 'integer|min:0',
                'has_phd' => 'boolean',
                'is_active' => 'boolean',
                'separation_date' => 'nullable|date|after:joining_date',
            ]);

            $faculty->update($validated);
            $faculty->refresh();

            return $this->successResponse($faculty, 'Faculty member updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Assign subject to faculty.
     */
    public function assignSubject(Request $request, NursingPharmacyFaculty $faculty): JsonResponse
    {
        try {
            $validated = $request->validate([
                'subject_id' => 'required|integer|exists:nursing_pharmacy_subjects,id',
                'role' => 'required|in:teaching,theory,practical,supervision,coordination',
                'is_primary' => 'boolean',
                'assignment_date' => 'required|date',
                'end_date' => 'nullable|date|after:assignment_date',
            ]);

            $assignment = NursingPharmacyFacultySubject::create(array_merge($validated, [
                'faculty_id' => $faculty->id,
            ]));

            return $this->successResponse($assignment, 'Subject assigned successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get faculty subjects.
     */
    public function getSubjects(NursingPharmacyFaculty $faculty, Request $request): JsonResponse
    {
        $subjects = $faculty->subjects()
            ->with('subject')
            ->when($request->boolean('active_only'), function ($q) {
                $q->whereDate('assignment_date', '<=', now())
                    ->where(function ($sq) {
                        $sq->whereNull('end_date')
                            ->orWhereDate('end_date', '>=', now());
                    });
            })
            ->get();

        return $this->successResponse($subjects, 'Faculty subjects retrieved successfully');
    }

    /**
     * Get availability status.
     */
    public function getAvailability(NursingPharmacyFaculty $faculty): JsonResponse
    {
        $availability = $faculty->getAvailabilityInfo();

        return $this->successResponse($availability, 'Faculty availability retrieved successfully');
    }

    /**
     * Get compliance status.
     */
    public function getCompliance(NursingPharmacyFaculty $faculty): JsonResponse
    {
        $compliance = $faculty->getComplianceStatus();

        return $this->successResponse($compliance, 'Faculty compliance status retrieved successfully');
    }

    /**
     * Delete faculty member.
     */
    public function destroy(NursingPharmacyFaculty $faculty): JsonResponse
    {
        $faculty->delete();

        return $this->successResponse(null, 'Faculty member deleted successfully');
    }
}
