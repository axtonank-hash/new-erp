<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResultAnalytics extends Model
{
    protected $table = 'result_analytics';
    protected $fillable = [
        'program_id',
        'semester',
        'pass_percentage',
        'subject_wise_performance',
        'faculty_impact',
    ];
}
