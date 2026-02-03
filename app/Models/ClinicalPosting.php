<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicalPosting extends Model
{
    protected $table = 'clinical_postings';
    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function hospital()
    {
        return $this->belongsTo(NursingPharmacyHospital::class, 'hospital_id');
    }

    public function department()
    {
        return $this->belongsTo(NursingPharmacyDepartment::class, 'department_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
