<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyStudentDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'student_profile_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
            'document_type' => 'required|in:10th_certificate,12th_certificate,entrance_exam_scorecard,neet_scorecard,bachelor_degree,intermediate_result,vaccination_record,health_certificate,internship_report,project_report,conduct_certificate',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
            'issue_date' => 'nullable|date|before_or_equal:today',
            'expiry_date' => 'nullable|date|after:issue_date',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Document file is required.',
            'file.mimes' => 'Document must be PDF, JPG, JPEG, PNG, or Word format.',
            'file.max' => 'Document size cannot exceed 5MB.',
            'expiry_date.after' => 'Expiry date must be after issue date.',
            'issue_date.before_or_equal' => 'Issue date cannot be in the future.',
            'document_type.in' => 'Invalid document type selected.',
        ];
    }
}
