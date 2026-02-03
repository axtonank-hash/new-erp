<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExtendedStudentProfile extends Model
{
    protected $table = 'extended_student_profiles';
    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function hospital()
    {
        return $this->belongsTo(NursingPharmacyHospital::class, 'hospital_id');
    }
}
