<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyClinicalPostingRequest extends FormRequest
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
            'hospital_id' => 'required|integer|exists:nursing_pharmacy_hospitals,id',
            'department_id' => 'required|integer|exists:nursing_pharmacy_departments,id',
            'posting_start_date' => 'required|date|after_or_equal:today',
            'posting_end_date' => 'required|date|after:posting_start_date',
            'required_hours' => 'required|integer|min:40|max:800',
            'posting_type' => 'required|in:nursing,pharmacy,general,specialized',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'posting_end_date.after' => 'End date must be after start date.',
            'required_hours.min' => 'Required hours must be at least 40.',
            'required_hours.max' => 'Required hours cannot exceed 800.',
            'posting_start_date.after_or_equal' => 'Start date cannot be in the past.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'required_hours' => $this->input('required_hours', 480),
        ]);
    }
}
