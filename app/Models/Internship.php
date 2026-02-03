<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = [
        'student_id',
        'company_id',
        'supervisor_name',
        'start_date',
        'end_date',
        'duration_days',
        'status',
        'supervisor_feedback',
        'industry_feedback',
        'certificate_path',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
