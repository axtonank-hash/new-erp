<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyAcademicTranscript extends Model
{
    protected $table = 'nursing_pharmacy_academic_transcripts';

    public $timestamps = true;

    protected $fillable = [
        'student_profile_id',
        'program_id',
        'cumulative_gpa',
        'cumulative_percentage',
        'total_credits_earned',
        'total_credits_required',
        'total_semesters_completed',
        'total_subjects_passed',
        'total_subjects_failed',
        'total_backlogs',
        'current_backlog_count',
        'academic_standing',
        'academic_remarks',
        'highest_sem_gpa',
        'highest_sem_number',
        'dean_list_count',
        'is_active',
        'last_updated_at',
    ];

    protected $casts = [
        'cumulative_gpa' => 'decimal:2',
        'cumulative_percentage' => 'decimal:2',
        'highest_sem_gpa' => 'decimal:2',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Get student profile.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyStudentProfile::class);
    }

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Update transcript after exam result.
     */
    public function updateFromResults(): bool
    {
        $student = $this->studentProfile;
        $results = NursingPharmacyExamResult::where('student_profile_id', $this->student_profile_id)
            ->get();

        if ($results->isEmpty()) {
            return false;
        }

        $passed = $results->where('result_status', 'pass')->count();
        $failed = $results->where('result_status', 'fail')->count();

        $this->total_subjects_passed = $passed;
        $this->total_subjects_failed = $failed;

        // Calculate cumulative percentage
        $totalMarks = $results->sum('total_marks');
        $maxPossible = $results->count() * 100; // Assuming max 100 per exam
        $this->cumulative_percentage = $maxPossible > 0 ? round(($totalMarks / $maxPossible) * 100, 2) : 0;

        // Update academic standing
        $this->determineAcademicStanding();

        $this->last_updated_at = now();
        return $this->save();
    }

    /**
     * Determine academic standing.
     */
    private function determineAcademicStanding(): void
    {
        if ($this->cumulative_percentage >= 85) {
            $this->academic_standing = 'excellent';
        } elseif ($this->cumulative_percentage >= 75) {
            $this->academic_standing = 'good';
        } elseif ($this->cumulative_percentage >= 60) {
            $this->academic_standing = 'satisfactory';
        } elseif ($this->current_backlog_count > 3) {
            $this->academic_standing = 'probation';
        } else {
            $this->academic_standing = 'poor';
        }
    }

    /**
     * Check if on dean's list.
     */
    public function isOnDeansList(): bool
    {
        return $this->cumulative_percentage >= 80 && $this->current_backlog_count === 0;
    }

    /**
     * Check if eligible for graduation.
     */
    public function isEligibleForGraduation(): bool
    {
        return $this->total_subjects_failed === 0 
            && $this->current_backlog_count === 0
            && $this->total_credits_earned >= $this->total_credits_required;
    }

    /**
     * Get transcript summary.
     */
    public function getSummary(): array
    {
        return [
            'cumulative_gpa' => $this->cumulative_gpa,
            'cumulative_percentage' => $this->cumulative_percentage,
            'academic_standing' => $this->academic_standing,
            'subjects_passed' => $this->total_subjects_passed,
            'subjects_failed' => $this->total_subjects_failed,
            'current_backlogs' => $this->current_backlog_count,
            'eligible_for_graduation' => $this->isEligibleForGraduation(),
            'on_dean_list' => $this->isOnDeansList(),
        ];
    }
}
