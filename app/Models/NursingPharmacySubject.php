<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacySubject extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_subjects';

    protected $fillable = [
        'program_id',
        'name',
        'code',
        'semester',
        'credit_hours',
        'theory_hours',
        'practical_hours',
        'is_mandatory',
        'regulatory_body',
        'description',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'semester' => 'integer',
        'credit_hours' => 'integer',
        'theory_hours' => 'integer',
        'practical_hours' => 'integer',
    ];

    /**
     * Get the program that owns the subject.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class, 'program_id');
    }

    /**
     * Get the curriculum entries for this subject.
     */
    public function curriculumEntries(): HasMany
    {
        return $this->hasMany(NursingPharmacyCurriculum::class, 'subject_id');
    }

    /**
     * Get total hours (theory + practical).
     */
    public function getTotalHours(): int
    {
        return $this->theory_hours + $this->practical_hours;
    }

    /**
     * Get practical to theory ratio.
     */
    public function getPracticalTheoryRatio(): float
    {
        $total = $this->getTotalHours();
        return $total > 0 ? ($this->practical_hours / $total) : 0;
    }

    /**
     * Validate practical/theory ratio for compliance.
     */
    public function validatePracticalTheoryRatio(): array
    {
        $errors = [];
        $ratio = $this->getPracticalTheoryRatio();

        if ($this->regulatory_body === 'INC') {
            // INC: practical should not exceed 40% for most subjects
            if ($ratio > 0.40) {
                $errors[] = "Practical ratio ({$ratio}%) exceeds INC limit (40%)";
            }
        } elseif ($this->regulatory_body === 'PCI') {
            // PCI: practical can be up to 50% for laboratory-heavy subjects
            if ($ratio > 0.50) {
                $errors[] = "Practical ratio ({$ratio}%) exceeds PCI limit (50%)";
            }
        }

        return $errors;
    }

    /**
     * Validate credit hours for PCI compliance.
     */
    public function validateCreditHours(): array
    {
        $errors = [];

        if ($this->regulatory_body !== 'PCI' && $this->credit_hours === null) {
            return $errors; // Credit hours only required for PCI
        }

        if ($this->regulatory_body === 'PCI') {
            if ($this->credit_hours === null || $this->credit_hours <= 0) {
                $errors[] = "Credit hours must be defined for PCI-regulated subjects";
            }

            // PCI typically: 1 credit = 1 hour theory or 2 hours practical
            $expectedCredits = $this->theory_hours + ($this->practical_hours / 2);
            if (abs($this->credit_hours - $expectedCredits) > 0.5) {
                $errors[] = "Credit hours ({$this->credit_hours}) doesn't match calculation ({$expectedCredits})";
            }
        }

        return $errors;
    }

    /**
     * Get subject validation report.
     */
    public function getValidationReport(): array
    {
        return [
            'subject_id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'program_id' => $this->program_id,
            'practical_theory_errors' => $this->validatePracticalTheoryRatio(),
            'credit_hours_errors' => $this->validateCreditHours(),
            'total_hours' => $this->getTotalHours(),
            'practical_theory_ratio' => round($this->getPracticalTheoryRatio() * 100, 2) . '%',
        ];
    }
}
