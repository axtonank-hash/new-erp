<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type', // nursing, pharmacy
        'program_type', // ANM, GNM, BSc, D.Pharm, B.Pharm, M.Pharm, Pharm.D, etc
        'duration_years',
        'duration_months',
        'total_intake_limit',
        'starting_semester',
        'clinical_hours_required',
        'theory_hours_required',
        'regulatory_body', // INC, PCI
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'duration_years' => 'integer',
        'duration_months' => 'integer',
        'total_intake_limit' => 'integer',
        'starting_semester' => 'integer',
        'clinical_hours_required' => 'integer',
        'theory_hours_required' => 'integer',
    ];

    /**
     * Get the subjects for the program.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get the curricula for the program.
     */
    public function curricula(): HasMany
    {
        return $this->hasMany(Curriculum::class);
    }

    /**
     * Validate INC minimum hours compliance for nursing programs.
     */
    public function validateINCCompliance(): bool
    {
        if ($this->type !== 'nursing') {
            return true;
        }

        // INC minimum hours vary by program type
        $incMinimums = [
            'ANM' => 1200, // example values
            'GNM' => 1500,
            'BSc' => 2000,
        ];

        $required = $incMinimums[$this->program_type] ?? 1200;
        return $this->clinical_hours_required >= ($required * 0.4); // 40% clinical minimum
    }

    /**
     * Validate PCI credit system compliance for pharmacy programs.
     */
    public function validatePCICompliance(): bool
    {
        if ($this->type !== 'pharmacy') {
            return true;
        }

        // PCI requires specific credit calculations
        $creditsByProgram = [
            'D.Pharm' => 64,
            'B.Pharm' => 150,
            'M.Pharm' => 80,
            'Pharm.D' => 280,
        ];

        return isset($creditsByProgram[$this->program_type]);
    }
}
