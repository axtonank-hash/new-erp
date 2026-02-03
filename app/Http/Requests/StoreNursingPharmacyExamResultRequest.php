<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyExamResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'examination_id' => 'required|integer|exists:nursing_pharmacy_examinations,id',
            'student_id' => 'required|integer|exists:nursing_pharmacy_student_profiles,id',
            'internal_marks' => 'nullable|numeric|min:0|max:50',
            'practical_marks' => 'nullable|numeric|min:0|max:50',
            'external_marks' => 'nullable|numeric|min:0|max:100',
            'total_marks' => 'required|numeric|min:0',
            'grace_marks_applied' => 'nullable|numeric|min:0|max:10',
            'grace_marks_reason' => 'nullable|string|max:500',
            'result_status' => 'required|in:pass,fail,pending,recheck_pending,awaiting_supplementary',
            'remarks' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'examination_id.exists' => 'The selected examination does not exist',
            'student_id.exists' => 'The selected student does not exist',
        ];
    }
}
