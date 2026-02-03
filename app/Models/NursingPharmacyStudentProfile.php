<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyStudentProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_student_profiles';

    protected $fillable = [
        'student_id',
        'program_id',
        'registration_number',
        'inc_registration_number',
        'pci_registration_number',
        'clinical_hours_completed',
        'lab_practical_hours',
        'industrial_training_hours',
        'industrial_training_status',
        'project_status',
        'dissertation_link',
        'project_title',
        'current_hospital_id',
        'current_department_id',
        'latest_ward_rotation_start',
        'latest_ward_rotation_end',
        'clinical_summary',
        'eligible_for_exam',
        'eligibility_check_date',
        'eligibility_notes',
    ];

    protected $casts = [
        'clinical_hours_completed' => 'integer',
        'lab_practical_hours' => 'integer',
        'industrial_training_hours' => 'integer',
        'eligible_for_exam' => 'boolean',
        'latest_ward_rotation_start' => 'date',
        'latest_ward_rotation_end' => 'date',
        'eligibility_check_date' => 'date',
    ];

    /**
     * Get the student user.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Get the current hospital.
     */
    public function currentHospital(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyHospital::class, 'current_hospital_id');
    }

    /**
     * Get the current department.
     */
    public function currentDepartment(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyDepartment::class, 'current_department_id');
    }

    /**
     * Get clinical postings.
     */
    public function clinicalPostings(): HasMany
    {
        return $this->hasMany(NursingPharmacyClinicalPosting::class, 'student_id', 'student_id');
    }

    /**
     * Get student documents.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(NursingPharmacyStudentDocument::class, 'student_id', 'student_id');
    }

    /**
     * Check if student is eligible for exam.
     */
    public function checkExamEligibility(): array
    {
        $errors = [];

        if (!$this->program) {
            $errors[] = "Student program not found";
            return $errors;
        }

        $programType = $this->program->type;

        if ($programType === 'nursing') {
            // Check clinical hours for nursing
            $requiredHours = $this->program->clinical_hours_required ?? 0;
            $minPercentage = 80; // 80% of required hours
            $minimumHours = ($requiredHours * $minPercentage) / 100;

            if ($this->clinical_hours_completed < $minimumHours) {
                $errors[] = "Clinical hours ({$this->clinical_hours_completed}) below minimum 80% ({$minimumHours})";
            }

            // Check required documents
            $requiredDocs = ['inc_registration', 'medical_fitness'];
            foreach ($requiredDocs as $docType) {
                $doc = $this->documents()
                    ->where('document_type', $docType)
                    ->where('verification_status', 'verified')
                    ->latest()
                    ->first();

                if (!$doc) {
                    $errors[] = "Required document missing: {$docType}";
                }
            }
        } elseif ($programType === 'pharmacy') {
            // Check lab hours and industrial training
            if ($this->lab_practical_hours < ($this->program->theory_hours_required ?? 0) * 0.4) {
                $errors[] = "Lab practical hours below minimum requirement";
            }

            if ($this->industrial_training_status !== 'completed') {
                $errors[] = "Industrial training not completed";
            }

            // Check required documents
            $requiredDocs = ['pci_registration'];
            foreach ($requiredDocs as $docType) {
                $doc = $this->documents()
                    ->where('document_type', $docType)
                    ->where('verification_status', 'verified')
                    ->latest()
                    ->first();

                if (!$doc) {
                    $errors[] = "Required document missing: {$docType}";
                }
            }
        }

        return $errors;
    }

    /**
     * Get eligibility report.
     */
    public function getEligibilityReport(): array
    {
        $errors = $this->checkExamEligibility();
        $isEligible = empty($errors);

        return [
            'student_id' => $this->student_id,
            'eligible_for_exam' => $isEligible,
            'check_date' => now(),
            'errors' => $errors,
            'program_type' => $this->program->type,
            'progress' => $this->getProgressMetrics(),
        ];
    }

    /**
     * Get student progress metrics.
     */
    public function getProgressMetrics(): array
    {
        $metrics = [
            'registration_complete' => !empty($this->registration_number),
        ];

        if ($this->program->type === 'nursing') {
            $metrics['clinical_hours_percentage'] = $this->program->clinical_hours_required > 0
                ? round(($this->clinical_hours_completed / $this->program->clinical_hours_required) * 100, 2)
                : 0;
            $metrics['clinical_postings_completed'] = $this->clinicalPostings()
                ->where('status', 'completed')
                ->count();
        } elseif ($this->program->type === 'pharmacy') {
            $metrics['lab_hours_percentage'] = round(($this->lab_practical_hours / 500) * 100, 2);
            $metrics['industrial_training_status'] = $this->industrial_training_status;
            $metrics['project_status'] = $this->project_status;
        }

        return $metrics;
    }

    /**
     * Mark as eligible for exam.
     */
    public function markEligibleForExam(): bool
    {
        $errors = $this->checkExamEligibility();
        
        if (empty($errors)) {
            $this->update([
                'eligible_for_exam' => true,
                'eligibility_check_date' => now(),
                'eligibility_notes' => 'Eligible for exam',
            ]);
            return true;
        }

        $this->update([
            'eligible_for_exam' => false,
            'eligibility_check_date' => now(),
            'eligibility_notes' => implode('; ', $errors),
        ]);

        return false;
    }
}
