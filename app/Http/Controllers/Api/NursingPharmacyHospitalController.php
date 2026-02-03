<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyHospital;
use App\Models\NursingPharmacyDepartment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyHospitalController extends ApiController
{
    /**
     * List hospitals.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyHospital::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by city
        if ($request->has('city')) {
            $query->where('city', $request->input('city'));
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $hospitals = $query->with('activeDepartments')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($hospitals, 'Hospitals retrieved successfully');
    }

    /**
     * Get hospital details.
     */
    public function show(NursingPharmacyHospital $hospital): JsonResponse
    {
        $hospital->load('departments');
        $detailedInfo = $hospital->getDetailedInfo();

        return $this->successResponse($detailedInfo, 'Hospital details retrieved successfully');
    }

    /**
     * Create hospital.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:nursing_pharmacy_hospitals',
                'code' => 'required|string|max:50|unique:nursing_pharmacy_hospitals',
                'address' => 'required|string',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:100',
                'pin_code' => 'required|string|max:10',
                'phone' => 'required|string|max:20',
                'email' => 'required|email|unique:nursing_pharmacy_hospitals',
                'principal_contact' => 'nullable|string|max:255',
                'principal_phone' => 'nullable|string|max:20',
                'total_bed_strength' => 'required|integer|min:1',
                'specialties' => 'nullable|array',
                'description' => 'nullable|string',
            ]);

            $hospital = NursingPharmacyHospital::create($validated);

            return $this->successResponse($hospital, 'Hospital created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Update hospital.
     */
    public function update(Request $request, NursingPharmacyHospital $hospital): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'string|max:255|unique:nursing_pharmacy_hospitals,name,' . $hospital->id,
                'code' => 'string|max:50|unique:nursing_pharmacy_hospitals,code,' . $hospital->id,
                'address' => 'string',
                'city' => 'string|max:100',
                'state' => 'string|max:100',
                'pin_code' => 'string|max:10',
                'phone' => 'string|max:20',
                'email' => 'email|unique:nursing_pharmacy_hospitals,email,' . $hospital->id,
                'principal_contact' => 'nullable|string|max:255',
                'principal_phone' => 'nullable|string|max:20',
                'total_bed_strength' => 'integer|min:1',
                'specialties' => 'nullable|array',
                'description' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $hospital->update($validated);
            $hospital->refresh();

            return $this->successResponse($hospital, 'Hospital updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get hospital capacity.
     */
    public function getCapacity(NursingPharmacyHospital $hospital): JsonResponse
    {
        $info = $hospital->getDetailedInfo();

        return $this->successResponse([
            'total_beds' => $info['total_bed_strength'],
            'available_beds' => $info['available_beds'],
            'occupied_beds' => $info['total_bed_strength'] - $info['available_beds'],
            'occupancy_percentage' => round((($info['total_bed_strength'] - $info['available_beds']) / $info['total_bed_strength']) * 100, 2),
            'current_students' => $info['current_students'],
        ], 'Hospital capacity retrieved successfully');
    }

    /**
     * Get departments.
     */
    public function getDepartments(NursingPharmacyHospital $hospital, Request $request): JsonResponse
    {
        $departments = $hospital->departments()
            ->where('is_active', $request->boolean('active', true))
            ->get()
            ->map(function ($dept) {
                return array_merge($dept->toArray(), $dept->getCapacityInfo());
            });

        return $this->successResponse($departments, 'Departments retrieved successfully');
    }

    /**
     * Add department to hospital.
     */
    public function addDepartment(Request $request, NursingPharmacyHospital $hospital): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50',
                'head_name' => 'nullable|string|max:255',
                'head_phone' => 'nullable|string|max:20',
                'bed_strength' => 'required|integer|min:1',
                'description' => 'nullable|string',
            ]);

            $validated['hospital_id'] = $hospital->id;
            $department = NursingPharmacyDepartment::create($validated);

            return $this->successResponse($department, 'Department added successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get available hospitals for posting.
     */
    public function getAvailableForPosting(Request $request): JsonResponse
    {
        $requiredBeds = $request->input('required_beds', 1);

        $hospitals = NursingPharmacyHospital::where('is_active', true)
            ->get()
            ->filter(function ($hospital) use ($requiredBeds) {
                return $hospital->canAcceptStudents($requiredBeds);
            })
            ->map(function ($hospital) {
                return array_merge($hospital->toArray(), $hospital->getDetailedInfo());
            });

        return $this->successResponse($hospitals, 'Available hospitals retrieved successfully');
    }

    /**
     * Delete hospital.
     */
    public function destroy(NursingPharmacyHospital $hospital): JsonResponse
    {
        $hospital->delete();

        return $this->successResponse(null, 'Hospital deleted successfully');
    }
}
