<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyAttendanceRecord;
use App\Models\NursingPharmacyAttendanceThreshold;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyAttendanceController extends ApiController
{
    /**
     * Record attendance.
     */
    public function recordAttendance(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
                'attendance_date' => 'required|date|before_or_equal:today',
                'attendance_type' => 'required|in:theory,clinical,lab,internship,project,seminar',
                'status' => 'required|in:present,absent,leave,excused_absence,half_day',
                'hour_duration' => 'decimal:2|min:0.25|max:12',
                'faculty_id' => 'nullable|integer|exists:nursing_pharmacy_faculty,id',
                'department_id' => 'nullable|integer|exists:nursing_pharmacy_departments,id',
                'hospital_id' => 'nullable|integer|exists:nursing_pharmacy_hospitals,id',
                'remarks' => 'nullable|string',
                'leave_reason' => 'nullable|string',
            ]);

            $record = NursingPharmacyAttendanceRecord::create($validated);

            return $this->successResponse($record, 'Attendance recorded successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get student attendance summary.
     */
    public function getStudentSummary($studentId, Request $request): JsonResponse
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $type = $request->input('type'); // Filter by attendance type

        $summary = NursingPharmacyAttendanceRecord::getDetailedSummary($studentId);

        // Filter by date range if provided
        if ($fromDate || $toDate) {
            $query = NursingPharmacyAttendanceRecord::where('student_profile_id', $studentId)
                ->where('approval_status', 'approved');

            if ($fromDate) {
                $query->whereDate('attendance_date', '>=', $fromDate);
            }
            if ($toDate) {
                $query->whereDate('attendance_date', '<=', $toDate);
            }

            $records = $query->get();
            $summary['filtered_count'] = $records->count();
            $summary['filtered_present'] = $records->whereIn('status', ['present', 'half_day'])->count();
        }

        return $this->successResponse($summary, 'Attendance summary retrieved successfully');
    }

    /**
     * Check exam eligibility.
     */
    public function checkEligibility($studentId, Request $request): JsonResponse
    {
        $threshold = $request->input('threshold', 80);
        $isEligible = NursingPharmacyAttendanceRecord::isEligibleForExam($studentId, $threshold);

        $summary = NursingPharmacyAttendanceRecord::getDetailedSummary($studentId);

        return $this->successResponse([
            'student_id' => $studentId,
            'is_eligible' => $isEligible,
            'overall_percentage' => $summary['overall_percentage'],
            'required_percentage' => $threshold,
            'summary' => $summary,
        ], 'Exam eligibility checked successfully');
    }

    /**
     * Get attendance thresholds.
     */
    public function getThresholds($programId, Request $request): JsonResponse
    {
        $semester = $request->input('semester');
        $threshold = NursingPharmacyAttendanceThreshold::getThreshold($programId, $semester);

        if (!$threshold) {
            return $this->errorResponse('No attendance thresholds configured for this program', 404);
        }

        return $this->successResponse($threshold, 'Attendance thresholds retrieved successfully');
    }

    /**
     * Bulk record attendance.
     */
    public function bulkRecord(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'records' => 'required|array|min:1',
                'records.*.student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
                'records.*.attendance_date' => 'required|date|before_or_equal:today',
                'records.*.attendance_type' => 'required|in:theory,clinical,lab,internship,project,seminar',
                'records.*.status' => 'required|in:present,absent,leave,excused_absence,half_day',
                'records.*.hour_duration' => 'decimal:2|min:0.25|max:12',
            ]);

            $created = [];
            foreach ($validated['records'] as $recordData) {
                $created[] = NursingPharmacyAttendanceRecord::create($recordData);
            }

            return $this->successResponse($created, 'Bulk attendance recorded successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get attendance report for department/program.
     */
    public function getDepartmentReport($departmentId, Request $request): JsonResponse
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $type = $request->input('type', 'theory');

        $query = NursingPharmacyAttendanceRecord::where('department_id', $departmentId)
            ->where('attendance_type', $type)
            ->where('approval_status', 'approved');

        if ($fromDate) {
            $query->whereDate('attendance_date', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('attendance_date', '<=', $toDate);
        }

        $records = $query->with('studentProfile')->get();

        $report = $records->groupBy('student_profile_id')->map(function ($studentRecords) {
            $present = $studentRecords->whereIn('status', ['present', 'half_day'])->count();
            $total = $studentRecords->count();

            return [
                'student_id' => $studentRecords->first()->student_profile_id,
                'present' => $present,
                'total' => $total,
                'percentage' => $total > 0 ? round(($present / $total) * 100, 2) : 0,
            ];
        });

        return $this->successResponse($report, 'Department attendance report retrieved successfully');
    }

    /**
     * Approve pending attendance.
     */
    public function approveAttendance(Request $request, NursingPharmacyAttendanceRecord $record): JsonResponse
    {
        if ($record->approval_status !== 'pending') {
            return $this->errorResponse('Only pending attendance can be approved', 400);
        }

        $record->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return $this->successResponse($record, 'Attendance approved successfully');
    }
}
