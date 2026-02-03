<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacySubjectRequest extends FormRequest
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
            'program_id' => 'required|exists:nursing_pharmacy_programs,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:nursing_pharmacy_subjects',
            'semester' => 'required|integer|min:1|max:12',
            'credit_hours' => 'nullable|integer|min:0|required_if:regulatory_body,PCI',
            'theory_hours' => 'required|integer|min:0',
            'practical_hours' => 'required|integer|min:0',
            'is_mandatory' => 'nullable|boolean',
            'regulatory_body' => 'required|in:INC,PCI,UNIVERSITY',
            'description' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate practical/theory ratio
            $theoryHours = $this->input('theory_hours', 0);
            $practicalHours = $this->input('practical_hours', 0);
            $regulatoryBody = $this->input('regulatory_body');

            $total = $theoryHours + $practicalHours;
            if ($total > 0) {
                $practicalRatio = $practicalHours / $total;

                if ($regulatoryBody === 'INC' && $practicalRatio > 0.40) {
                    $validator->errors()->add(
                        'practical_hours',
                        'INC regulations: Practical hours cannot exceed 40% of total hours'
                    );
                } elseif ($regulatoryBody === 'PCI' && $practicalRatio > 0.50) {
                    $validator->errors()->add(
                        'practical_hours',
                        'PCI regulations: Practical hours cannot exceed 50% of total hours'
                    );
                }
            }

            // Validate credit hours for PCI
            if ($regulatoryBody === 'PCI') {
                $creditHours = $this->input('credit_hours');
                $expectedCredits = $theoryHours + ($practicalHours / 2);
                
                if ($creditHours && abs($creditHours - $expectedCredits) > 0.5) {
                    $validator->errors()->add(
                        'credit_hours',
                        "Credit hours don't match PCI calculation. Expected around {$expectedCredits}"
                    );
                }
            }
        });
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'program_id.required' => 'Program is required',
            'program_id.exists' => 'Selected program does not exist',
            'name.required' => 'Subject name is required',
            'code.required' => 'Subject code is required',
            'code.unique' => 'Subject code must be unique',
            'semester.required' => 'Semester is required',
            'theory_hours.required' => 'Theory hours are required',
            'practical_hours.required' => 'Practical hours are required',
            'credit_hours.required_if' => 'Credit hours are required for PCI-regulated subjects',
        ];
    }
}
