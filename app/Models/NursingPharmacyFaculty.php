<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingPharmacyFaculty extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_faculty';

    protected $fillable = [
        'user_id',
        'faculty_code',
        'inc_registration_no',
        'pci_registration_no',
        'registration_expiry_date',
        'highest_qualification',
        'specialty',
        'sub_specialty',
        'clinical_eligible',
        'lab_supervision_eligible',
        'theory_eligible',
        'faculty_type',
        'department',
        'current_student_load',
        'max_student_load',
        'research_publications',
        'research_areas',
        'has_phd',
        'phone',
        'email',
        'address',
        'is_active',
        'joining_date',
        'separation_date',
        'remarks',
    ];

    protected $casts = [
        'clinical_eligible' => 'boolean',
        'lab_supervision_eligible' => 'boolean',
        'theory_eligible' => 'boolean',
        'has_phd' => 'boolean',
        'is_active' => 'boolean',
        'joining_date' => 'date',
        'separation_date' => 'date',
        'registration_expiry_date' => 'date',
    ];

    /**
     * Get associated user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get assigned subjects.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(NursingPharmacyFacultySubject::class, 'faculty_id');
    }

    /**
     * Get attendance records.
     */
    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(NursingPharmacyAttendanceRecord::class, 'faculty_id');
    }

    /**
     * Get clinical logbook entries.
     */
    public function clinicalLogbooks(): HasMany
    {
        return $this->hasMany(NursingPharmacyClinicalLogbook::class, 'faculty_id');
    }

    /**
     * Get lab practical sessions.
     */
    public function labPracticals(): HasMany
    {
        return $this->hasMany(NursingPharmacyLabPractical::class, 'faculty_id');
    }

    /**
     * Check if registration is valid.
     */
    public function isRegistrationValid(): bool
    {
        if (!$this->registration_expiry_date) {
            return true;
        }
        return $this->registration_expiry_date > now();
    }

    /**
     * Check if can supervise (clinical/lab).
     */
    public function canSupervise($type = 'clinical'): bool
    {
        return $type === 'clinical' ? $this->clinical_eligible : $this->lab_supervision_eligible;
    }

    /**
     * Check student load capacity.
     */
    public function hasCapacity($additionalStudents = 1): bool
    {
        return ($this->current_student_load + $additionalStudents) <= $this->max_student_load;
    }

    /**
     * Get availability info.
     */
    public function getAvailabilityInfo(): array
    {
        return [
            'is_active' => $this->is_active,
            'is_registered' => $this->isRegistrationValid(),
            'current_load' => $this->current_student_load,
            'max_load' => $this->max_student_load,
            'available_slots' => $this->max_student_load - $this->current_student_load,
            'can_teach_theory' => $this->theory_eligible,
            'can_supervise_clinical' => $this->clinical_eligible,
            'can_supervise_lab' => $this->lab_supervision_eligible,
        ];
    }

    /**
     * Get compliance status.
     */
    public function getComplianceStatus(): array
    {
        return [
            'faculty_code' => $this->faculty_code,
            'registration_valid' => $this->isRegistrationValid(),
            'registration_no' => $this->department === 'pharmacy' ? $this->pci_registration_no : $this->inc_registration_no,
            'qualifications' => $this->highest_qualification,
            'specialty' => $this->specialty,
            'has_phd' => $this->has_phd,
            'research_publications' => $this->research_publications,
            'supervision_eligible' => $this->clinical_eligible || $this->lab_supervision_eligible,
        ];
    }
}
