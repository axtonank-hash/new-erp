<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingPharmacyLabPractical extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_lab_practicals';

    protected $fillable = [
        'program_id',
        'subject_id',
        'faculty_id',
        'lab_name',
        'practical_date',
        'start_time',
        'end_time',
        'batch_number',
        'batch_size',
        'equipment_used',
        'setup_requirements',
        'safety_precautions',
        'practical_title',
        'practical_objective',
        'procedure_steps',
        'expected_outcomes',
        'total_marks',
        'internal_marks',
        'external_marks',
        'evaluation_criteria',
        'students_expected',
        'students_present',
        'status',
        'completed_at',
        'remarks',
    ];

    protected $casts = [
        'practical_date' => 'date',
        'start_time' => 'time',
        'end_time' => 'time',
        'equipment_used' => 'json',
        'completed_at' => 'datetime',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Get subject.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacySubject::class);
    }

    /**
     * Get faculty.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyFaculty::class);
    }

    /**
     * Get attendance records.
     */
    public function attendance(): HasMany
    {
        return $this->hasMany(NursingPharmacyLabPracticalAttendance::class, 'lab_practical_id');
    }

    /**
     * Mark practical as completed.
     */
    public function markCompleted(): bool
    {
        $this->status = 'completed';
        $this->completed_at = now();
        
        return $this->save();
    }

    /**
     * Get attendance summary.
     */
    public function getAttendanceSummary(): array
    {
        $records = $this->attendance;

        return [
            'expected' => $this->students_expected,
            'present' => $records->where('status', 'present')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'excused' => $records->where('status', 'excused')->count(),
            'attendance_percentage' => $this->students_expected > 0 
                ? round(($records->where('status', 'present')->count() / $this->students_expected) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get marks statistics.
     */
    public function getMarksStatistics(): array
    {
        $records = $this->attendance()
            ->whereNotNull('marks_obtained')
            ->get();

        if ($records->isEmpty()) {
            return [
                'total_students_evaluated' => 0,
                'average_marks' => 0,
                'highest_marks' => 0,
                'lowest_marks' => 0,
                'pass_percentage' => 0,
            ];
        }

        $marks = $records->pluck('marks_obtained');
        $passing = $marks->filter(fn($m) => $m >= ($this->total_marks * 0.40))->count();

        return [
            'total_students_evaluated' => $records->count(),
            'average_marks' => round($marks->avg(), 2),
            'highest_marks' => $marks->max(),
            'lowest_marks' => $marks->min(),
            'pass_percentage' => round(($passing / $records->count()) * 100, 2),
        ];
    }

    /**
     * Get practical summary.
     */
    public function getSummary(): array
    {
        return [
            'title' => $this->practical_title,
            'date' => $this->practical_date,
            'time' => "{$this->start_time} - {$this->end_time}",
            'batch' => $this->batch_number,
            'faculty' => $this->faculty?->user?->name,
            'status' => $this->status,
            'total_marks' => $this->total_marks,
            'attendance' => $this->getAttendanceSummary(),
            'marks' => $this->getMarksStatistics(),
        ];
    }
}
