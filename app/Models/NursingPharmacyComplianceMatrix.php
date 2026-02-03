<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyComplianceMatrix extends Model
{
    protected $table = 'nursing_pharmacy_compliance_matrices';

    public $timestamps = true;

    protected $fillable = [
        'program_id',
        'audit_date',
        'approved_intake_strength',
        'actual_students_enrolled',
        'faculty_requirement',
        'faculty_shortfall',
        'clinical_hours_required',
        'clinical_hours_available',
        'clinical_hours_percentage',
        'required_lab_equipment',
        'available_lab_equipment',
        'required_books',
        'available_books',
        'required_journals',
        'available_journals',
        'required_documents',
        'documents_compliant',
        'documents_deficient',
        'overall_compliance_score',
        'remarks',
    ];

    protected $casts = [
        'audit_date' => 'date',
        'faculty_requirement' => 'json',
        'clinical_hours_percentage' => 'decimal:2',
        'required_documents' => 'json',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Calculate overall compliance score.
     */
    public function calculateOverallScore(): int
    {
        $scores = [];

        // Student intake compliance (0-20 points)
        if ($this->approved_intake_strength > 0) {
            $intakeCompliance = ($this->actual_students_enrolled / $this->approved_intake_strength) * 100;
            $scores['intake'] = min(20, ($intakeCompliance / 100) * 20);
        }

        // Clinical hours compliance (0-25 points)
        if ($this->clinical_hours_required > 0) {
            $scores['clinical'] = min(25, ($this->clinical_hours_percentage / 100) * 25);
        }

        // Faculty compliance (0-20 points)
        if ($this->faculty_shortfall === 0) {
            $scores['faculty'] = 20;
        } else {
            $scores['faculty'] = max(0, 20 - ($this->faculty_shortfall * 2));
        }

        // Library resources (0-15 points)
        $totalBooks = ($this->available_books + $this->available_journals) / ($this->required_books + $this->required_journals);
        $scores['library'] = min(15, ($totalBooks / 100) * 15);

        // Documentation (0-20 points)
        if ($this->documents_deficient === 0) {
            $scores['documentation'] = 20;
        } else {
            $scores['documentation'] = max(0, 20 - ($this->documents_deficient * 2));
        }

        return (int)array_sum($scores);
    }

    /**
     * Get compliance status.
     */
    public function getComplianceStatus(): string
    {
        $score = $this->overall_compliance_score;

        if ($score >= 85) {
            return 'fully_compliant';
        } elseif ($score >= 70) {
            return 'substantially_compliant';
        } elseif ($score >= 50) {
            return 'partially_compliant';
        }

        return 'non_compliant';
    }

    /**
     * Get detailed matrix.
     */
    public function getDetailedMatrix(): array
    {
        return [
            'student_intake' => [
                'approved' => $this->approved_intake_strength,
                'actual' => $this->actual_students_enrolled,
                'variance' => $this->actual_students_enrolled - $this->approved_intake_strength,
            ],
            'faculty' => $this->faculty_requirement,
            'clinical_hours' => [
                'required' => $this->clinical_hours_required,
                'available' => $this->clinical_hours_available,
                'percentage' => $this->clinical_hours_percentage,
            ],
            'lab_equipment' => [
                'required' => $this->required_lab_equipment,
                'available' => $this->available_lab_equipment,
            ],
            'library' => [
                'books' => ['required' => $this->required_books, 'available' => $this->available_books],
                'journals' => ['required' => $this->required_journals, 'available' => $this->available_journals],
            ],
            'documentation' => [
                'compliant' => $this->documents_compliant,
                'deficient' => $this->documents_deficient,
            ],
            'overall_score' => $this->overall_compliance_score,
            'compliance_status' => $this->getComplianceStatus(),
        ];
    }
}
