<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyExamResult extends Model
{
    protected $table = 'nursing_pharmacy_exam_results';

    public $timestamps = true;

    protected $fillable = [
        'examination_id',
        'student_profile_id',
        'internal_marks',
        'practical_marks',
        'external_marks',
        'total_marks',
        'result_status',
        'grade',
        'grade_points',
        'grace_marks_applied',
        'grace_marks_reason',
        'is_supplementary',
        'supplementary_date',
        'supplementary_marks',
        'supplementary_status',
        'is_backlog',
        'backlog_count',
        'is_rechecked',
        'rechecked_marks',
        'rechecked_at',
        'remarks',
    ];

    protected $casts = [
        'internal_marks' => 'decimal:2',
        'practical_marks' => 'decimal:2',
        'external_marks' => 'decimal:2',
        'total_marks' => 'decimal:2',
        'grace_marks_applied' => 'decimal:2',
        'supplementary_marks' => 'decimal:2',
        'rechecked_marks' => 'decimal:2',
        'rechecked_at' => 'datetime',
        'supplementary_date' => 'date',
    ];

    /**
     * Get examination.
     */
    public function examination(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyExamination::class);
    }

    /**
     * Get student profile.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyStudentProfile::class);
    }

    /**
     * Calculate total marks.
     */
    public function calculateTotalMarks(): decimal
    {
        $total = 0;

        if ($this->internal_marks) {
            $total += $this->internal_marks;
        }
        if ($this->practical_marks) {
            $total += $this->practical_marks;
        }
        if ($this->external_marks) {
            $total += $this->external_marks;
        }

        return round($total, 2);
    }

    /**
     * Determine result status based on marks.
     */
    public function determineResultStatus(): string
    {
        if (!$this->total_marks) {
            return 'absent';
        }

        $totalMarks = $this->total_marks + $this->grace_marks_applied;
        $passingMarks = $this->examination->passing_marks;

        if ($totalMarks >= $passingMarks) {
            return 'pass';
        }

        return 'fail';
    }

    /**
     * Check if passed.
     */
    public function isPassed(): bool
    {
        return $this->result_status === 'pass';
    }

    /**
     * Get percentage score.
     */
    public function getPercentage(): float
    {
        if (!$this->total_marks) {
            return 0;
        }

        return round(($this->total_marks / $this->examination->max_marks) * 100, 2);
    }

    /**
     * Record supplementary result.
     */
    public function recordSupplementaryResult($marks, $status): bool
    {
        $this->supplementary_marks = $marks;
        $this->supplementary_status = $status;
        
        if ($status === 'pass') {
            $this->result_status = 'pass';
            $this->total_marks = $marks;
        }

        return $this->save();
    }

    /**
     * Apply grace marks.
     */
    public function applyGraceMarks($graceMarks, $reason): bool
    {
        $this->grace_marks_applied = $graceMarks;
        $this->grace_marks_reason = $reason;
        
        // Recalculate result status with grace marks
        $totalWithGrace = $this->total_marks + $graceMarks;
        if ($totalWithGrace >= $this->examination->passing_marks) {
            $this->result_status = 'pass';
        }

        return $this->save();
    }

    /**
     * Record recheck result.
     */
    public function recordRecheckResult($marks): bool
    {
        $this->is_rechecked = true;
        $this->rechecked_marks = $marks;
        $this->rechecked_at = now();
        $this->total_marks = $marks;

        // Update result status based on rechecked marks
        $this->result_status = $marks >= $this->examination->passing_marks ? 'pass' : 'fail';

        return $this->save();
    }

    /**
     * Get result summary.
     */
    public function getSummary(): array
    {
        return [
            'student_id' => $this->student_profile_id,
            'exam' => $this->examination->exam_name,
            'internal_marks' => $this->internal_marks,
            'practical_marks' => $this->practical_marks,
            'external_marks' => $this->external_marks,
            'total_marks' => $this->total_marks,
            'percentage' => $this->getPercentage(),
            'result_status' => $this->result_status,
            'grade' => $this->grade,
            'is_supplementary' => $this->is_supplementary,
            'is_backlog' => $this->is_backlog,
        ];
    }
}
