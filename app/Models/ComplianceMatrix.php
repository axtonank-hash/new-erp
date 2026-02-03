<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceMatrix extends Model
{
    protected $table = 'compliance_matrices';
    protected $fillable = [
        'matrix_type',
        'matrix_data',
        'effective_date',
    ];
}
