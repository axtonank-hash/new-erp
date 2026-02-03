<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyTranscriptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
            'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
            'cumulative_gpa' => 'required|numeric|min:0|max:4.0',
            'cumulative_percentage' => 'required|numeric|min:0|max:100',
            'total_credits' => 'required|integer|min:1',
            'credits_earned' => 'required|integer|min:0',
            'academic_standing' => 'required|in:excellent,good,satisfactory,poor,probation,terminated',
            'on_deans_list' => 'boolean',
            'graduation_eligible' => 'boolean',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.exists' => 'The selected student does not exist',
            'program_id.exists' => 'The selected program does not exist',
            'cumulative_gpa.max' => 'GPA cannot exceed 4.0',
            'cumulative_percentage.max' => 'Percentage cannot exceed 100',
        ];
    }
}
