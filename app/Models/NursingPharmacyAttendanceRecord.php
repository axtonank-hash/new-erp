<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingPharmacyAttendanceRecord extends Model
{
    protected $table = 'nursing_pharmacy_attendance_records';

    protected $fillable = [
        'student_profile_id',
        'faculty_id',
        'attendance_date',
        'start_time',
        'end_time',
        'attendance_type',
        'status',
        'ward_id',
        'department_id',
        'lab_id',
        'hospital_id',
        'hour_duration',
        'marks_obtained',
        'marks_total',
        'remarks',
        'leave_reason',
        'approval_status',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'start_time' => 'time',
        'end_time' => 'time',
        'hour_duration' => 'decimal:2',
        'marks_obtained' => 'decimal:2',
        'marks_total' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    /**
     * Get student profile.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyStudentProfile::class);
    }

    /**
     * Get faculty member.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyFaculty::class);
    }

    /**
     * Get department.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyDepartment::class);
    }

    /**
     * Get hospital.
     */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyHospital::class);
    }

    /**
     * Check if present.
     */
    public function isPresent(): bool
    {
        return in_array($this->status, ['present', 'half_day']);
    }

    /**
     * Calculate attendance percentage for a student.
     */
    public static function calculateAttendancePercentage($studentId, $type = null, $fromDate = null, $toDate = null): float
    {
        $query = self::where('student_profile_id', $studentId)
            ->where('approval_status', 'approved');

        if ($type) {
            $query->where('attendance_type', $type);
        }

        if ($fromDate) {
            $query->whereDate('attendance_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('attendance_date', '<=', $toDate);
        }

        $totalRecords = $query->count();
        if ($totalRecords === 0) {
            return 0;
        }

        $presentRecords = (clone $query)
            ->whereIn('status', ['present', 'half_day'])
            ->count();

        return round(($presentRecords / $totalRecords) * 100, 2);
    }

    /**
     * Get eligibility status for exam based on attendance.
     */
    public static function isEligibleForExam($studentId, $threshold = 80): bool
    {
        $overall = self::calculateAttendancePercentage($studentId);
        return $overall >= $threshold;
    }

    /**
     * Get detailed attendance summary.
     */
    public static function getDetailedSummary($studentId): array
    {
        $records = self::where('student_profile_id', $studentId)
            ->where('approval_status', 'approved')
            ->get();

        $theory = $records->where('attendance_type', 'theory');
        $clinical = $records->where('attendance_type', 'clinical');
        $lab = $records->where('attendance_type', 'lab');
        $internship = $records->where('attendance_type', 'internship');

        return [
            'theory_percentage' => self::calculateAttendancePercentage($studentId, 'theory'),
            'clinical_percentage' => self::calculateAttendancePercentage($studentId, 'clinical'),
            'lab_percentage' => self::calculateAttendancePercentage($studentId, 'lab'),
            'internship_percentage' => self::calculateAttendancePercentage($studentId, 'internship'),
            'overall_percentage' => self::calculateAttendancePercentage($studentId),
            'total_present' => $records->whereIn('status', ['present', 'half_day'])->count(),
            'total_absent' => $records->where('status', 'absent')->count(),
            'total_on_leave' => $records->where('status', 'leave')->count(),
            'total_hours_logged' => $records->sum('hour_duration'),
        ];
    }
}
