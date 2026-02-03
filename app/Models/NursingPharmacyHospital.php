<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyHospital extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_hospitals';

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'state',
        'pin_code',
        'phone',
        'email',
        'principal_contact',
        'principal_phone',
        'total_bed_strength',
        'specialties',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_bed_strength' => 'integer',
        'specialties' => 'array',
    ];

    /**
     * Get departments in this hospital.
     */
    public function departments(): HasMany
    {
        return $this->hasMany(NursingPharmacyDepartment::class, 'hospital_id');
    }

    /**
     * Get active departments.
     */
    public function activeDepartments(): HasMany
    {
        return $this->departments()->where('is_active', true);
    }

    /**
     * Get clinical postings at this hospital.
     */
    public function clinicalPostings(): HasMany
    {
        return $this->hasMany(NursingPharmacyClinicalPosting::class, 'hospital_id');
    }

    /**
     * Get active clinical postings.
     */
    public function activePostings(): HasMany
    {
        return $this->clinicalPostings()->where('status', 'in_progress');
    }

    /**
     * Get available bed count.
     */
    public function getAvailableBeds(): int
    {
        $totalBeds = $this->total_bed_strength;
        $occupiedBeds = $this->clinicalPostings()
            ->where('status', 'in_progress')
            ->count();

        return max(0, $totalBeds - $occupiedBeds);
    }

    /**
     * Check if hospital can accept more students.
     */
    public function canAcceptStudents(int $count = 1): bool
    {
        return $this->getAvailableBeds() >= $count;
    }

    /**
     * Get hospital details with departments.
     */
    public function getDetailedInfo(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'total_bed_strength' => $this->total_bed_strength,
            'available_beds' => $this->getAvailableBeds(),
            'total_departments' => $this->departments()->count(),
            'active_departments' => $this->activeDepartments()->count(),
            'current_students' => $this->activePostings()->count(),
            'specialties' => $this->specialties,
            'contact' => [
                'phone' => $this->phone,
                'email' => $this->email,
                'principal_contact' => $this->principal_contact,
                'principal_phone' => $this->principal_phone,
            ],
        ];
    }
}
