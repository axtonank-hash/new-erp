<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceAudit extends Model
{
    protected $table = 'compliance_audits';
    protected $fillable = [
        'audit_type',
        'audit_date',
        'auditor_id',
        'compliance_status',
        'compliance_score',
        'audit_status',
        'findings',
        'actions',
    ];
}
