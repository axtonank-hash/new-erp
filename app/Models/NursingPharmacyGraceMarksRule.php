<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyGraceMarksRule extends Model
{
    protected $table = 'nursing_pharmacy_grace_marks_rules';

    public $timestamps = true;

    protected $fillable = [
        'program_id',
        'rule_name',
        'description',
        'min_marks_percentage',
        'max_grace_marks',
        'max_application_count',
        'applicable_exam_types',
        'applicable_semesters',
        'is_active',
        'effective_from',
        'effective_to',
        'remarks',
    ];

    protected $casts = [
        'min_marks_percentage' => 'decimal:2',
        'applicable_exam_types' => 'json',
        'applicable_semesters' => 'json',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Check if rule is applicable.
     */
    public function isApplicable($examType, $semester = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if (!in_array($examType, $this->applicable_exam_types ?? [])) {
            return false;
        }

        if ($this->applicable_semesters && !in_array($semester, $this->applicable_semesters)) {
            return false;
        }

        return now()->between($this->effective_from, $this->effective_to ?? now());
    }

    /**
     * Check if marks qualify for grace.
     */
    public function qualifyForGrace($marks, $maxMarks): bool
    {
        $percentage = ($marks / $maxMarks) * 100;
        return $percentage >= $this->min_marks_percentage;
    }
}
