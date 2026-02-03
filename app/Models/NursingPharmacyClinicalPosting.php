<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyClinicalPosting extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_clinical_postings';

    protected $fillable = [
        'student_id',
        'hospital_id',
        'department_id',
        'supervisor_id',
        'start_date',
        'end_date',
        'hours_completed',
        'target_hours',
        'supervisor_feedback',
        'status',
        'performance_rating',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'hours_completed' => 'integer',
        'target_hours' => 'integer',
        'performance_rating' => 'float',
    ];

    /**
     * Get the student.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the hospital.
     */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyHospital::class, 'hospital_id');
    }

    /**
     * Get the department.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyDepartment::class, 'department_id');
    }

    /**
     * Get the supervisor.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Get hours completion percentage.
     */
    public function getHoursCompletionPercentage(): float
    {
        if ($this->target_hours === 0) {
            return 0;
        }

        return round(($this->hours_completed / $this->target_hours) * 100, 2);
    }

    /**
     * Check if posting hours are complete.
     */
    public function isHoursComplete(): bool
    {
        return $this->hours_completed >= $this->target_hours;
    }

    /**
     * Get posting duration in days.
     */
    public function getDurationInDays(): int
    {
        if (!$this->end_date) {
            return $this->start_date->diffInDays(now());
        }

        return $this->start_date->diffInDays($this->end_date);
    }

    /**
     * Update posting status based on current date.
     */
    public function updateStatus(): void
    {
        $today = now()->toDateString();

        if ($this->status === 'scheduled' && $this->start_date->toDateString() <= $today) {
            $this->status = 'in_progress';
        }

        if ($this->end_date && $this->end_date->toDateString() < $today && $this->status === 'in_progress') {
            $this->status = 'completed';
        }

        $this->save();
    }

    /**
     * Get posting summary.
     */
    public function getSummary(): array
    {
        return [
            'posting_id' => $this->id,
            'student_id' => $this->student_id,
            'hospital' => $this->hospital->name,
            'department' => $this->department->name,
            'duration_days' => $this->getDurationInDays(),
            'hours_completed' => $this->hours_completed,
            'target_hours' => $this->target_hours,
            'completion_percentage' => $this->getHoursCompletionPercentage(),
            'is_complete' => $this->isHoursComplete(),
            'status' => $this->status,
            'performance_rating' => $this->performance_rating,
            'supervisor_feedback' => $this->supervisor_feedback,
        ];
    }
}
