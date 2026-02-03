<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyLabPractical;
use App\Models\NursingPharmacyLabPracticalAttendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyLabPracticalController extends ApiController
{
    /**
     * List lab practicals.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NursingPharmacyLabPractical::query();

        // Filter by program
        if ($request->has('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        // Filter by subject
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->input('subject_id'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Date range
        if ($request->has('from_date')) {
            $query->whereDate('practical_date', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('practical_date', '<=', $request->input('to_date'));
        }

        $practicals = $query->with('program', 'subject', 'faculty.user')
            ->orderBy('practical_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($practicals, 'Lab practicals retrieved successfully');
    }

    /**
     * Create lab practical.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
                'subject_id' => 'required|integer|exists:nursing_pharmacy_subjects,id',
                'faculty_id' => 'nullable|integer|exists:nursing_pharmacy_faculty,id',
                'lab_name' => 'required|string|max:255',
                'practical_date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'batch_number' => 'integer|min:1',
                'batch_size' => 'integer|min:5|max:100',
                'equipment_used' => 'nullable|json',
                'practical_title' => 'required|string|max:255',
                'practical_objective' => 'required|string',
                'procedure_steps' => 'required|string',
                'expected_outcomes' => 'nullable|string',
                'total_marks' => 'required|integer|min:10|max:100',
                'internal_marks' => 'required|integer|min:0',
                'external_marks' => 'required|integer|min:0',
                'evaluation_criteria' => 'nullable|string',
            ]);

            $practical = NursingPharmacyLabPractical::create($validated);

            return $this->successResponse($practical, 'Lab practical created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get lab practical.
     */
    public function show(NursingPharmacyLabPractical $practical): JsonResponse
    {
        $practical->load('program', 'subject', 'faculty.user', 'attendance.studentProfile');
        $summary = array_merge($practical->toArray(), $practical->getSummary());

        return $this->successResponse($summary, 'Lab practical retrieved successfully');
    }

    /**
     * Update lab practical.
     */
    public function update(Request $request, NursingPharmacyLabPractical $practical): JsonResponse
    {
        if ($practical->status === 'completed') {
            return $this->errorResponse('Cannot update completed lab practical', 400);
        }

        try {
            $validated = $request->validate([
                'lab_name' => 'string|max:255',
                'practical_date' => 'date|after_or_equal:today',
                'start_time' => 'date_format:H:i',
                'end_time' => 'date_format:H:i',
                'batch_size' => 'integer|min:5|max:100',
                'practical_title' => 'string|max:255',
                'practical_objective' => 'string',
                'procedure_steps' => 'string',
                'expected_outcomes' => 'nullable|string',
                'total_marks' => 'integer|min:10|max:100',
                'evaluation_criteria' => 'nullable|string',
            ]);

            $practical->update($validated);

            return $this->successResponse($practical, 'Lab practical updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Record attendance for practical.
     */
    public function recordAttendance(Request $request, NursingPharmacyLabPractical $practical): JsonResponse
    {
        try {
            $validated = $request->validate([
                'attendance_records' => 'required|array|min:1',
                'attendance_records.*.student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
                'attendance_records.*.status' => 'required|in:present,absent,excused',
                'attendance_records.*.marks_obtained' => 'nullable|numeric|min:0',
                'attendance_records.*.performance_notes' => 'nullable|string',
            ]);

            $created = [];
            foreach ($validated['attendance_records'] as $record) {
                $record['lab_practical_id'] = $practical->id;
                $created[] = NursingPharmacyLabPracticalAttendance::create($record);
            }

            // Update practical students present count
            $practical->students_present = count(array_filter($validated['attendance_records'], fn($r) => $r['status'] === 'present'));
            $practical->students_expected = count($validated['attendance_records']);
            $practical->save();

            return $this->successResponse($created, 'Attendance recorded successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get attendance summary.
     */
    public function getAttendance(NursingPharmacyLabPractical $practical): JsonResponse
    {
        $summary = $practical->getAttendanceSummary();

        return $this->successResponse($summary, 'Attendance summary retrieved successfully');
    }

    /**
     * Get marks statistics.
     */
    public function getMarkStatistics(NursingPharmacyLabPractical $practical): JsonResponse
    {
        $stats = $practical->getMarksStatistics();

        return $this->successResponse($stats, 'Marks statistics retrieved successfully');
    }

    /**
     * Mark practical as completed.
     */
    public function markCompleted(NursingPharmacyLabPractical $practical): JsonResponse
    {
        if ($practical->markCompleted()) {
            return $this->successResponse($practical, 'Lab practical marked as completed');
        }

        return $this->errorResponse('Failed to mark practical as completed', 400);
    }

    /**
     * Delete lab practical.
     */
    public function destroy(NursingPharmacyLabPractical $practical): JsonResponse
    {
        if ($practical->status === 'completed') {
            return $this->errorResponse('Cannot delete completed lab practical', 400);
        }

        $practical->delete();

        return $this->successResponse(null, 'Lab practical deleted successfully');
    }
}
