<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyStudentProfileRequest extends FormRequest
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
            'user_id' => 'required|integer|exists:users,id|unique:nursing_pharmacy_student_profiles',
            'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
            'enrollment_number' => 'required|string|max:100|unique:nursing_pharmacy_student_profiles',
            'enrollment_date' => 'required|date',
            'batch_year' => 'required|integer|min:' . (date('Y') - 10) . '|max:' . date('Y'),
            'specialization' => 'nullable|string|max:255',
            'semester' => 'required|integer|between:1,8',
            'current_gpa' => 'nullable|numeric|min:0|max:4.0',
            'clinical_hours_completed' => 'nullable|integer|min:0',
            'document_status' => 'nullable|in:pending,verified,rejected',
            'is_active' => 'boolean',
            'remarks' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'user_id.unique' => 'This user is already enrolled as a student.',
            'enrollment_number.unique' => 'This enrollment number is already in use.',
            'batch_year.min' => 'Batch year cannot be older than 10 years.',
            'batch_year.max' => 'Batch year cannot be in the future.',
            'semester.between' => 'Semester must be between 1 and 8.',
            'current_gpa.max' => 'GPA cannot exceed 4.0.',
        ];
    }
}
