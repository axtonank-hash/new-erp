<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyClinicalPosting;
use App\Models\NursingPharmacyStudentProfile;
use App\Models\NursingPharmacyHospital;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyClinicalPostingController extends ApiController
{
    /**
     * List clinical postings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyClinicalPosting::query();

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('student_id', $request->input('student_id'));
        }

        // Filter by hospital
        if ($request->has('hospital_id')) {
            $query->where('hospital_id', $request->input('hospital_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $postings = $query->with(['student', 'hospital', 'department', 'supervisor'])
            ->paginate($request->input('per_page', 20));

        return $this->successResponse($postings, 'Clinical postings retrieved successfully');
    }

    /**
     * Get single clinical posting.
     */
    public function show(NursingPharmacyClinicalPosting $posting): JsonResponse
    {
        $posting->load(['student', 'hospital', 'department', 'supervisor']);
        $summary = $posting->getSummary();

        return $this->successResponse($summary, 'Clinical posting retrieved successfully');
    }

    /**
     * Create clinical posting.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:users,id',
                'hospital_id' => 'required|exists:nursing_pharmacy_hospitals,id',
                'department_id' => 'required|exists:nursing_pharmacy_departments,id',
                'supervisor_id' => 'nullable|exists:users,id',
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after:start_date',
                'target_hours' => 'required|integer|min:1',
            ]);

            // Check hospital capacity
            $hospital = NursingPharmacyHospital::find($validated['hospital_id']);
            if (!$hospital->canAcceptStudents()) {
                return $this->errorResponse(
                    ['hospital' => 'Hospital at full capacity'],
                    'Cannot create posting - hospital full',
                    422
                );
            }

            $posting = NursingPharmacyClinicalPosting::create($validated);
            $posting->load(['student', 'hospital', 'department']);

            // Update student profile current posting
            $profile = NursingPharmacyStudentProfile::where('student_id', $validated['student_id'])->first();
            if ($profile) {
                $profile->update([
                    'current_hospital_id' => $validated['hospital_id'],
                    'current_department_id' => $validated['department_id'],
                ]);
            }

            return $this->successResponse($posting, 'Clinical posting created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Update clinical posting.
     */
    public function update(Request $request, NursingPharmacyClinicalPosting $posting): JsonResponse
    {
        try {
            $validated = $request->validate([
                'hours_completed' => 'integer|min:0',
                'end_date' => 'nullable|date|after:start_date',
                'supervisor_feedback' => 'nullable|string',
                'status' => 'in:scheduled,in_progress,completed,postponed,cancelled',
                'performance_rating' => 'nullable|numeric|min:0|max:5',
            ]);

            $posting->update($validated);
            $posting->refresh();

            return $this->successResponse($posting, 'Clinical posting updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Delete clinical posting.
     */
    public function destroy(NursingPharmacyClinicalPosting $posting): JsonResponse
    {
        $posting->delete();

        return $this->successResponse(null, 'Clinical posting deleted successfully');
    }

    /**
     * Get posting summary.
     */
    public function getSummary(NursingPharmacyClinicalPosting $posting): JsonResponse
    {
        $posting->updateStatus(); // Update status based on dates
        $summary = $posting->getSummary();

        return $this->successResponse($summary, 'Posting summary retrieved successfully');
    }

    /**
     * Auto-allocate students to hospitals.
     */
    public function autoAllocate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => 'required|exists:nursing_pharmacy_programs,id',
                'start_date' => 'required|date',
                'target_hours' => 'required|integer|min:1',
                'batch_size' => 'integer|min:1|default:5',
            ]);

            $students = NursingPharmacyStudentProfile::where('program_id', $validated['program_id'])
                ->whereNull('current_hospital_id')
                ->limit(20)
                ->get();

            $allocated = [];
            $hospitals = NursingPharmacyHospital::where('is_active', true)
                ->with('activeDepartments')
                ->get();

            foreach ($students as $student) {
                foreach ($hospitals as $hospital) {
                    if ($hospital->canAcceptStudents()) {
                        $dept = $hospital->activeDepartments()->first();
                        if ($dept && $dept->canAcceptStudents()) {
                            $posting = NursingPharmacyClinicalPosting::create([
                                'student_id' => $student->student_id,
                                'hospital_id' => $hospital->id,
                                'department_id' => $dept->id,
                                'start_date' => $validated['start_date'],
                                'target_hours' => $validated['target_hours'],
                                'status' => 'scheduled',
                            ]);

                            $allocated[] = $posting;
                            break;
                        }
                    }
                }
            }

            return $this->successResponse(
                ['allocated_count' => count($allocated), 'postings' => $allocated],
                count($allocated) . ' students allocated successfully',
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get hospital-wise student mapping.
     */
    public function getHospitalMapping(Request $request): JsonResponse
    {
        $programId = $request->input('program_id');

        $hospitals = NursingPharmacyHospital::where('is_active', true)
            ->with(['clinicalPostings' => function ($q) {
                $q->where('status', 'in_progress');
            }])
            ->get()
            ->map(function ($hospital) {
                return [
                    'hospital_id' => $hospital->id,
                    'hospital_name' => $hospital->name,
                    'capacity_info' => $hospital->getDetailedInfo(),
                    'current_students' => $hospital->activePostings()->count(),
                    'available_capacity' => $hospital->getAvailableBeds(),
                ];
            });

        return $this->successResponse($hospitals, 'Hospital mapping retrieved successfully');
    }

    /**
     * Get posting with hours tracking.
     */
    public function getWithHoursTracking(NursingPharmacyClinicalPosting $posting): JsonResponse
    {
        $posting->updateStatus();
        
        return $this->successResponse([
            'posting' => $posting->getSummary(),
            'hours_remaining' => max(0, $posting->target_hours - $posting->hours_completed),
            'days_remaining' => $posting->end_date ? max(0, now()->diffInDays($posting->end_date)) : null,
            'completion_status' => $posting->isHoursComplete() ? 'complete' : 'in_progress',
        ], 'Hours tracking retrieved successfully');
    }
}
