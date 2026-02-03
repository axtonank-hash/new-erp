<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyComplianceAuditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
            'audit_type' => 'required|in:self_assessment,internal_inspection,external_inspection,regulatory_inspection',
            'audit_date' => 'required|date',
            'category' => 'required|in:student_intake,faculty_qualification,clinical_hours,lab_infrastructure,documentation,financial,infrastructure,overall',
            'audit_team' => 'nullable|json',
            'deficiencies' => 'nullable|json',
            'observations' => 'nullable|json',
            'compliance_score' => 'required|integer|min:0|max:100',
            'compliance_status' => 'required|in:compliant,partial,non_compliant,pending_action',
            'corrective_actions' => 'nullable|string',
            'corrective_action_due_date' => 'nullable|date|after:today',
            'audit_status' => 'in:open,closed,pending_review',
        ];
    }

    public function messages(): array
    {
        return [
            'program_id.exists' => 'The selected program does not exist',
            'audit_date.required' => 'Audit date is required',
            'compliance_score.integer' => 'Compliance score must be a number between 0 and 100',
        ];
    }
}
