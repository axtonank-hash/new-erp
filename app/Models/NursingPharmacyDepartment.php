<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyDepartment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_departments';

    protected $fillable = [
        'hospital_id',
        'name',
        'code',
        'head_name',
        'head_phone',
        'bed_strength',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'bed_strength' => 'integer',
    ];

    /**
     * Get the hospital.
     */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyHospital::class, 'hospital_id');
    }

    /**
     * Get clinical postings in this department.
     */
    public function clinicalPostings(): HasMany
    {
        return $this->hasMany(NursingPharmacyClinicalPosting::class, 'department_id');
    }

    /**
     * Get active clinical postings.
     */
    public function activePostings(): HasMany
    {
        return $this->clinicalPostings()->where('status', 'in_progress');
    }

    /**
     * Get available beds in this department.
     */
    public function getAvailableBeds(): int
    {
        $totalBeds = $this->bed_strength;
        $occupiedBeds = $this->activePostings()->count();

        return max(0, $totalBeds - $occupiedBeds);
    }

    /**
     * Get occupancy percentage.
     */
    public function getOccupancyPercentage(): float
    {
        if ($this->bed_strength === 0) {
            return 0;
        }

        $occupiedBeds = $this->activePostings()->count();
        return round(($occupiedBeds / $this->bed_strength) * 100, 2);
    }

    /**
     * Check if department can accept students.
     */
    public function canAcceptStudents(int $count = 1): bool
    {
        return $this->getAvailableBeds() >= $count;
    }

    /**
     * Get department capacity info.
     */
    public function getCapacityInfo(): array
    {
        return [
            'total_beds' => $this->bed_strength,
            'occupied_beds' => $this->activePostings()->count(),
            'available_beds' => $this->getAvailableBeds(),
            'occupancy_percentage' => $this->getOccupancyPercentage(),
            'can_accept_students' => $this->canAcceptStudents(),
        ];
    }
}
