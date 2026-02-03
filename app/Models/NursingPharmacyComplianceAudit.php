<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NursingPharmacyComplianceAudit extends Model
{
    use SoftDeletes;

    protected $table = 'nursing_pharmacy_compliance_audits';

    protected $fillable = [
        'program_id',
        'audit_type',
        'audit_date',
        'auditor_id',
        'category',
        'compliance_status',
        'compliance_score',
        'deficiencies',
        'observations',
        'corrective_actions',
        'corrective_action_due_date',
        'corrective_action_taken',
        'corrective_action_completed_at',
        'remarks',
        'attachment_path',
        'audit_status',
    ];

    protected $casts = [
        'deficiencies' => 'json',
        'observations' => 'json',
        'audit_date' => 'date',
        'corrective_action_due_date' => 'date',
        'corrective_action_completed_at' => 'datetime',
    ];

    /**
     * Get program.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(NursingPharmacyProgram::class);
    }

    /**
     * Get auditor (if faculty/staff).
     */
    public function auditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    /**
     * Close audit.
     */
    public function closeAudit(): bool
    {
        $this->audit_status = 'closed';
        return $this->save();
    }

    /**
     * Escalate audit.
     */
    public function escalate(): bool
    {
        $this->audit_status = 'escalated';
        return $this->save();
    }

    /**
     * Get audit summary.
     */
    public function getSummary(): array
    {
        return [
            'audit_type' => $this->audit_type,
            'audit_date' => $this->audit_date,
            'category' => $this->category,
            'compliance_status' => $this->compliance_status,
            'compliance_score' => $this->compliance_score,
            'deficiency_count' => count($this->deficiencies ?? []),
            'audit_status' => $this->audit_status,
            'corrective_action_due' => $this->corrective_action_due_date,
        ];
    }
}
