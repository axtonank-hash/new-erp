<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyLabPracticalAttendance extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_lab_practical_attendance';

    protected $fillable = [
        'lab_practical_id',
        'student_profile_id',
        'status',
        'marks_obtained',
        'performance_notes',
        'equipment_proficiency',
        'technique_assessment',
        'faculty_id',
        'faculty_feedback',
        'faculty_rating',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'equipment_proficiency' => 'json',
    ];

    /**
     * Get lab practical.
     */
    public function labPractical(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyLabPractical::class);
    }

    /**
     * Get student profile.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyStudentProfile::class);
    }

    /**
     * Get faculty member.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyFaculty::class);
    }

    /**
     * Record marks.
     */
    public function recordMarks($marks, $notes = null): bool
    {
        $this->marks_obtained = $marks;
        $this->performance_notes = $notes;
        
        return $this->save();
    }

    /**
     * Record faculty feedback.
     */
    public function recordFeedback($facultyId, $feedback, $rating): bool
    {
        $this->faculty_id = $facultyId;
        $this->faculty_feedback = $feedback;
        $this->faculty_rating = $rating;
        
        return $this->save();
    }

    /**
     * Check if passed.
     */
    public function isPassed(): bool
    {
        $totalMarks = $this->labPractical->total_marks;
        $passingMarks = $totalMarks * 0.40; // 40% passing
        
        return $this->marks_obtained >= $passingMarks;
    }

    /**
     * Get performance percentage.
     */
    public function getPercentage(): float
    {
        if (!$this->marks_obtained) {
            return 0;
        }

        return round(($this->marks_obtained / $this->labPractical->total_marks) * 100, 2);
    }

    /**
     * Get attendance summary.
     */
    public function getSummary(): array
    {
        return [
            'practical' => $this->labPractical->practical_title,
            'date' => $this->labPractical->practical_date,
            'status' => $this->status,
            'marks' => $this->marks_obtained,
            'percentage' => $this->getPercentage(),
            'passed' => $this->isPassed(),
            'faculty_rating' => $this->faculty_rating,
            'performance_notes' => $this->performance_notes,
        ];
    }
}
