<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyCurriculum extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_curricula';

    protected $fillable = [
        'program_id',
        'subject_id',
        'academic_year',
        'sequence',
        'batch_specific',
        'is_locked',
        'locked_by',
        'locked_at',
        'notes',
    ];

    protected $casts = [
        'batch_specific' => 'boolean',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
        'academic_year' => 'integer',
        'sequence' => 'integer',
    ];

    /**
     * Get the program that owns this curriculum.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class, 'program_id');
    }

    /**
     * Get the subject for this curriculum entry.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacySubject::class, 'subject_id');
    }

    /**
     * Get the user who locked this curriculum.
     */
    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    /**
     * Lock the curriculum entry.
     */
    public function lock(int $userId): bool
    {
        if ($this->is_locked) {
            return false; // Already locked
        }

        $this->update([
            'is_locked' => true,
            'locked_by' => $userId,
            'locked_at' => now(),
        ]);

        return true;
    }

    /**
     * Unlock the curriculum entry.
     */
    public function unlock(): bool
    {
        if (!$this->is_locked) {
            return false; // Not locked
        }

        $this->update([
            'is_locked' => false,
            'locked_by' => null,
            'locked_at' => null,
        ]);

        return true;
    }

    /**
     * Check if curriculum can be modified.
     */
    public function isEditable(): bool
    {
        return !$this->is_locked;
    }

    /**
     * Get curriculum for a specific academic year.
     */
    public static function forAcademicYear(int $programId, int $academicYear)
    {
        return static::where('program_id', $programId)
            ->where('academic_year', $academicYear)
            ->orderBy('sequence')
            ->get();
    }

    /**
     * Get all semesters/years in curriculum.
     */
    public static function getYears(int $programId)
    {
        return static::where('program_id', $programId)
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->toArray();
    }
}
