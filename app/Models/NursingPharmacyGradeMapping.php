<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyGradeMapping extends Model
{
    protected $table = 'nursing_pharmacy_grade_mappings';

    public $timestamps = true;

    protected $fillable = [
        'program_id',
        'grade',
        'min_percentage',
        'max_percentage',
        'grade_points',
        'description',
        'remarks',
    ];

    protected $casts = [
        'min_percentage' => 'decimal:2',
        'max_percentage' => 'decimal:2',
        'grade_points' => 'decimal:2',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Get grade for percentage.
     */
    public static function getGradeForPercentage($programId, $percentage)
    {
        return self::where('program_id', $programId)
            ->where('min_percentage', '<=', $percentage)
            ->where('max_percentage', '>=', $percentage)
            ->first();
    }

    /**
     * Get grade points for percentage.
     */
    public static function getGradePoints($programId, $percentage): float
    {
        $grade = self::getGradeForPercentage($programId, $percentage);
        return $grade ? $grade->grade_points : 0;
    }
}
