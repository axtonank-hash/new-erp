<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\ValidateINCClinicalHours;
use App\Rules\ValidatePCICreditHours;

class StoreNursingPharmacyProgramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'super-admin', 'principal', 'academic-coordinator']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:nursing_pharmacy_programs',
            'type' => 'required|in:nursing,pharmacy',
            'program_type' => 'required|string|max:100',
            'duration_years' => 'required|integer|min:1|max:10',
            'duration_months' => 'nullable|integer|min:0|max:11',
            'total_intake_limit' => 'required|integer|min:1|max:500',
            'starting_semester' => 'nullable|integer|min:1|max:8',
            'clinical_hours_required' => 'nullable|integer|min:0|required_if:type,nursing|new ValidateINCClinicalHours($this->input("program_type"))',
            'theory_hours_required' => 'nullable|integer|min:0|required_if:type,nursing',
            'regulatory_body' => 'required|in:INC,PCI,UNIVERSITY',
            'is_active' => 'nullable|boolean',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Program name is required',
            'name.unique' => 'A program with this name already exists',
            'type.required' => 'Program type (nursing/pharmacy) is required',
            'program_type.required' => 'Program type code is required',
            'duration_years.required' => 'Duration in years is required',
            'duration_years.min' => 'Duration must be at least 1 year',
            'total_intake_limit.required' => 'Student intake limit is required',
            'clinical_hours_required.required_if' => 'Clinical hours are required for nursing programs',
            'theory_hours_required.required_if' => 'Theory hours are required for nursing programs',
        ];
    }

    /**
     * Get custom validation attributes.
     */
    public function attributes(): array
    {
        return [
            'name' => 'program name',
            'type' => 'program type',
            'program_type' => 'program classification',
            'duration_years' => 'duration (years)',
            'total_intake_limit' => 'intake limit',
            'clinical_hours_required' => 'clinical hours',
            'theory_hours_required' => 'theory hours',
            'regulatory_body' => 'regulatory body',
        ];
    }
}
