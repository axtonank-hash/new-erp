<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingPharmacyClinicalLogbook extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_clinical_logbooks';

    protected $fillable = [
        'student_profile_id',
        'clinical_posting_id',
        'faculty_id',
        'entry_date',
        'procedure_name',
        'procedure_description',
        'ward',
        'patient_category',
        'competencies_checklist',
        'competencies_completed',
        'competencies_total',
        'observations',
        'learning_points',
        'challenges',
        'achievements',
        'supervisor_id',
        'supervisor_feedback',
        'supervisor_rating',
        'supervisor_approved_at',
        'status',
        'rejection_reason',
        'is_locked',
        'locked_at',
    ];

    protected $casts = [
        'competencies_checklist' => 'json',
        'entry_date' => 'date',
        'supervisor_approved_at' => 'datetime',
        'locked_at' => 'datetime',
        'is_locked' => 'boolean',
    ];

    /**
     * Get student profile.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyStudentProfile::class);
    }

    /**
     * Get clinical posting.
     */
    public function clinicalPosting(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyClinicalPosting::class);
    }

    /**
     * Get faculty member.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyFaculty::class);
    }

    /**
     * Get supervisor user.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Submit logbook entry.
     */
    public function submit(): bool
    {
        if ($this->is_locked) {
            return false;
        }

        $this->status = 'submitted';
        return $this->save();
    }

    /**
     * Approve logbook entry.
     */
    public function approve($supervisorId, $feedback = null): bool
    {
        $this->supervisor_id = $supervisorId;
        $this->supervisor_feedback = $feedback;
        $this->supervisor_rating = 'excellent';
        $this->supervisor_approved_at = now();
        $this->status = 'approved';
        
        return $this->save();
    }

    /**
     * Reject logbook entry.
     */
    public function reject($reason): bool
    {
        if ($this->is_locked) {
            return false;
        }

        $this->status = 'rejected';
        $this->rejection_reason = $reason;
        
        return $this->save();
    }

    /**
     * Lock entry after approval.
     */
    public function lock(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }

        $this->is_locked = true;
        $this->locked_at = now();
        
        return $this->save();
    }

    /**
     * Calculate competency completion.
     */
    public function updateCompetencyStatus(): void
    {
        $checklist = $this->competencies_checklist ?? [];
        
        $completed = 0;
        foreach ($checklist as $item) {
            if ($item['status'] === 'completed') {
                $completed++;
            }
        }

        $this->competencies_completed = $completed;
        $this->competencies_total = count($checklist);
        $this->save();
    }

    /**
     * Get competency completion percentage.
     */
    public function getCompletionPercentage(): float
    {
        if ($this->competencies_total === 0) {
            return 0;
        }

        return round(($this->competencies_completed / $this->competencies_total) * 100, 2);
    }

    /**
     * Get logbook summary.
     */
    public function getSummary(): array
    {
        return [
            'entry_date' => $this->entry_date,
            'procedure' => $this->procedure_name,
            'ward' => $this->ward,
            'status' => $this->status,
            'competency_completion' => $this->getCompletionPercentage(),
            'supervisor_rating' => $this->supervisor_rating,
            'is_locked' => $this->is_locked,
        ];
    }
}
