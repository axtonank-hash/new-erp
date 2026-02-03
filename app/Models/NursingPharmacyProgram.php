<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyProgram extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_programs';

    protected $fillable = [
        'name',
        'type',
        'program_type',
        'duration_years',
        'duration_months',
        'total_intake_limit',
        'starting_semester',
        'clinical_hours_required',
        'theory_hours_required',
        'regulatory_body',
        'is_active',
        'description',
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
        return $this->hasMany(NursingPharmacySubject::class, 'program_id');
    }

    /**
     * Get the curricula for the program.
     */
    public function curricula(): HasMany
    {
        return $this->hasMany(NursingPharmacyCurriculum::class, 'program_id');
    }

    /**
     * Get active subjects only.
     */
    public function activeSubjects(): HasMany
    {
        return $this->subjects()->where('is_active', true);
    }

    /**
     * Validate INC minimum hours compliance for nursing programs.
     */
    public function validateINCCompliance(): array
    {
        $errors = [];

        if ($this->type !== 'nursing') {
            return $errors;
        }

        // INC minimum hours vary by program type
        $incMinimums = [
            'ANM' => ['clinical' => 480, 'theory' => 720],
            'GNM' => ['clinical' => 600, 'theory' => 900],
            'BSc' => ['clinical' => 800, 'theory' => 1200],
        ];

        if (!isset($incMinimums[$this->program_type])) {
            $errors[] = "Unknown program type: {$this->program_type}";
            return $errors;
        }

        $required = $incMinimums[$this->program_type];

        if ($this->clinical_hours_required < $required['clinical']) {
            $errors[] = "Clinical hours ({$this->clinical_hours_required}) below INC minimum ({$required['clinical']})";
        }

        if ($this->theory_hours_required < $required['theory']) {
            $errors[] = "Theory hours ({$this->theory_hours_required}) below INC minimum ({$required['theory']})";
        }

        return $errors;
    }

    /**
     * Validate PCI credit system compliance for pharmacy programs.
     */
    public function validatePCICompliance(): array
    {
        $errors = [];

        if ($this->type !== 'pharmacy') {
            return $errors;
        }

        // PCI requires specific credit calculations per program
        $creditsByProgram = [
            'D.Pharm' => ['min' => 64, 'max' => 66],
            'B.Pharm' => ['min' => 150, 'max' => 152],
            'M.Pharm' => ['min' => 80, 'max' => 82],
            'Pharm.D' => ['min' => 280, 'max' => 282],
        ];

        if (!isset($creditsByProgram[$this->program_type])) {
            $errors[] = "Unknown pharmacy program type: {$this->program_type}";
            return $errors;
        }

        // Calculate total credits from subjects
        $totalCredits = $this->subjects()->sum('credit_hours');
        $required = $creditsByProgram[$this->program_type];

        if ($totalCredits < $required['min'] || $totalCredits > $required['max']) {
            $errors[] = "Total credits ({$totalCredits}) out of PCI range ({$required['min']}-{$required['max']})";
        }

        return $errors;
    }

    /**
     * Get program details for compliance reports.
     */
    public function getComplianceReport(): array
    {
        $report = [
            'program_id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'program_type' => $this->program_type,
            'regulatory_body' => $this->regulatory_body,
        ];

        if ($this->type === 'nursing') {
            $report['inc_compliance'] = [
                'errors' => $this->validateINCCompliance(),
                'clinical_hours' => $this->clinical_hours_required,
                'theory_hours' => $this->theory_hours_required,
            ];
        } elseif ($this->type === 'pharmacy') {
            $report['pci_compliance'] = [
                'errors' => $this->validatePCICompliance(),
                'total_credits' => $this->subjects()->sum('credit_hours'),
            ];
        }

        return $report;
    }
}
