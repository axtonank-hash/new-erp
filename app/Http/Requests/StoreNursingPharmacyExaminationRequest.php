<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyExaminationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
            'exam_name' => 'required|string|max:255',
            'exam_code' => 'required|string|max:100|unique:nursing_pharmacy_examinations,exam_code',
            'exam_type' => 'required|in:internal,practical,university,supplementary',
            'exam_date' => 'required|date|after_or_equal:today',
            'exam_time' => 'required|date_format:H:i',
            'duration_minutes' => 'required|integer|min:30|max:300',
            'total_marks' => 'required|numeric|min:10|max:1000',
            'passing_marks' => 'required|numeric|min:0|max:1000|lte:total_marks',
            'internal_marks' => 'nullable|numeric|min:0|max:50',
            'external_marks' => 'nullable|numeric|min:0|max:100',
            'practical_marks' => 'nullable|numeric|min:0|max:50',
            'semester' => 'nullable|integer|min:1|max:10',
            'subject_id' => 'nullable|integer|exists:nursing_pharmacy_subjects,id',
            'exam_center' => 'nullable|string|max:255',
            'invigilators' => 'nullable|json',
            'status' => 'in:scheduled,conducted,results_published,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'exam_code.unique' => 'An examination with this code already exists',
            'exam_date.after_or_equal' => 'Exam date must be today or in the future',
            'passing_marks.lte' => 'Passing marks cannot exceed total marks',
        ];
    }
}
