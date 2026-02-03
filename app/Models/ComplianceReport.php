<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceReport extends Model
{
    protected $table = 'compliance_reports';
    protected $fillable = [
        'report_type',
        'program_id',
        'semester',
        'data',
        'report_date',
        'status',
    ];
}
