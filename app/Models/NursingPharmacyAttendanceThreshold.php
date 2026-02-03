<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyAttendanceThreshold extends Model
{
    protected $table = 'nursing_pharmacy_attendance_thresholds';

    protected $fillable = [
        'program_id',
        'semester',
        'min_theory_percentage',
        'min_clinical_percentage',
        'min_lab_percentage',
        'min_internship_percentage',
        'min_seminar_percentage',
        'min_overall_percentage',
        'min_percentage_for_exam_eligibility',
        'grace_absent_days',
        'grace_leave_days',
        'effective_from',
        'effective_to',
        'is_active',
        'remarks',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Get applicable threshold for semester.
     */
    public static function getThreshold($programId, $semester = null)
    {
        $query = self::where('program_id', $programId)
            ->where('is_active', true)
            ->whereDate('effective_from', '<=', now());

        if ($semester) {
            $query->where(function ($q) use ($semester) {
                $q->whereNull('semester')
                    ->orWhere('semester', $semester);
            });
        }

        return $query->first();
    }

    /**
     * Check if student meets attendance threshold.
     */
    public function checkStudentEligibility($studentId): array
    {
        $summary = NursingPharmacyAttendanceRecord::getDetailedSummary($studentId);

        return [
            'theory_eligible' => $summary['theory_percentage'] >= $this->min_theory_percentage,
            'clinical_eligible' => $summary['clinical_percentage'] >= $this->min_clinical_percentage,
            'lab_eligible' => $summary['lab_percentage'] >= $this->min_lab_percentage,
            'internship_eligible' => $summary['internship_percentage'] >= $this->min_internship_percentage,
            'overall_eligible' => $summary['overall_percentage'] >= $this->min_overall_percentage,
            'exam_eligible' => $summary['overall_percentage'] >= $this->min_percentage_for_exam_eligibility,
            'shortages' => $this->getShortages($summary),
        ];
    }

    /**
     * Get attendance shortages.
     */
    private function getShortages($summary): array
    {
        $shortages = [];

        if ($summary['theory_percentage'] < $this->min_theory_percentage) {
            $shortages[] = [
                'type' => 'theory',
                'required' => $this->min_theory_percentage,
                'current' => $summary['theory_percentage'],
                'shortage' => round($this->min_theory_percentage - $summary['theory_percentage'], 2),
            ];
        }

        if ($summary['clinical_percentage'] < $this->min_clinical_percentage) {
            $shortages[] = [
                'type' => 'clinical',
                'required' => $this->min_clinical_percentage,
                'current' => $summary['clinical_percentage'],
                'shortage' => round($this->min_clinical_percentage - $summary['clinical_percentage'], 2),
            ];
        }

        if ($summary['lab_percentage'] < $this->min_lab_percentage) {
            $shortages[] = [
                'type' => 'lab',
                'required' => $this->min_lab_percentage,
                'current' => $summary['lab_percentage'],
                'shortage' => round($this->min_lab_percentage - $summary['lab_percentage'], 2),
            ];
        }

        return $shortages;
    }
}
