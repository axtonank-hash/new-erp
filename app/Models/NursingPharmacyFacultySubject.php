<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyFacultySubject extends Model
{
    protected $table = 'nursing_pharmacy_faculty_subjects';

    public $timestamps = true;

    protected $fillable = [
        'faculty_id',
        'subject_id',
        'role',
        'is_primary',
        'student_count',
        'max_batch_size',
        'assignment_date',
        'end_date',
        'remarks',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'assignment_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get faculty.
     */
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyFaculty::class);
    }

    /**
     * Get subject.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacySubject::class);
    }

    /**
     * Check if currently active.
     */
    public function isActive(): bool
    {
        return $this->assignment_date <= now()->toDateString() 
            && (!$this->end_date || $this->end_date >= now()->toDateString());
    }
}
