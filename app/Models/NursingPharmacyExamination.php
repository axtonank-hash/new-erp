<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NursingPharmacyExamination extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_examinations';

    protected $fillable = [
        'program_id',
        'subject_id',
        'semester',
        'exam_name',
        'exam_type',
        'exam_date',
        'start_time',
        'end_time',
        'exam_venue',
        'max_marks',
        'passing_marks',
        'internal_weight_percentage',
        'external_weight_percentage',
        'status',
        'remarks',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'start_time' => 'time',
        'end_time' => 'time',
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
     * Get exam results.
     */
    public function results(): HasMany
    {
        return $this->hasMany(NursingPharmacyExamResult::class, 'examination_id');
    }

    /**
     * Mark exam as completed.
     */
    public function markCompleted(): bool
    {
        $this->status = 'completed';
        return $this->save();
    }

    /**
     * Get result statistics.
     */
    public function getResultStatistics(): array
    {
        $results = $this->results;

        return [
            'total_appeared' => $results->count(),
            'total_passed' => $results->where('result_status', 'pass')->count(),
            'total_failed' => $results->where('result_status', 'fail')->count(),
            'total_absent' => $results->where('result_status', 'absent')->count(),
            'pass_percentage' => $results->count() > 0 
                ? round(($results->where('result_status', 'pass')->count() / $results->count()) * 100, 2)
                : 0,
            'average_marks' => round($results->whereNotNull('total_marks')->avg('total_marks'), 2),
            'highest_marks' => $results->max('total_marks'),
            'lowest_marks' => $results->min('total_marks'),
        ];
    }

    /**
     * Get exam summary.
     */
    public function getSummary(): array
    {
        return [
            'exam_name' => $this->exam_name,
            'exam_type' => $this->exam_type,
            'exam_date' => $this->exam_date,
            'max_marks' => $this->max_marks,
            'passing_marks' => $this->passing_marks,
            'status' => $this->status,
            'statistics' => $this->getResultStatistics(),
        ];
    }
}
