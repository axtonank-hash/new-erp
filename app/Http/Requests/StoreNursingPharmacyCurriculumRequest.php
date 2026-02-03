<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNursingPharmacyCurriculumRequest extends FormRequest
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
            'subject_id' => 'required|exists:nursing_pharmacy_subjects,id',
            'academic_year' => 'required|integer|min:1|max:10',
            'sequence' => 'required|integer|min:1|max:100',
            'batch_specific' => 'nullable|boolean',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Check if subject belongs to program
            $subject = \App\Models\NursingPharmacySubject::find($this->input('subject_id'));
            if ($subject && $subject->program_id != $this->input('program_id')) {
                $validator->errors()->add(
                    'subject_id',
                    'Selected subject does not belong to the specified program'
                );
            }

            // Check for duplicates
            $existing = \App\Models\NursingPharmacyCurriculum::where([
                'program_id' => $this->input('program_id'),
                'subject_id' => $this->input('subject_id'),
                'academic_year' => $this->input('academic_year'),
            ])->first();

            if ($existing && $existing->id != $this->route('curriculum')?->id) {
                $validator->errors()->add(
                    'subject_id',
                    'This subject is already in the curriculum for this academic year'
                );
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
            'subject_id.required' => 'Subject is required',
            'subject_id.exists' => 'Selected subject does not exist',
            'academic_year.required' => 'Academic year is required',
            'academic_year.integer' => 'Academic year must be a number',
            'sequence.required' => 'Sequence/order is required',
            'sequence.integer' => 'Sequence must be a number',
        ];
    }
}
