<?php

namespace App\Http\Controllers;

use App\Models\NursingPharmacyFaculty;
use Illuminate\Http\Request;

class NursingPharmacyFacultyController extends Controller
{
    public function index()
    {
        return NursingPharmacyFaculty::with('user')->get();
    }

    public function show($id)
    {
        return NursingPharmacyFaculty::with('user')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id|unique:nursing_pharmacy_faculty,user_id',
            'inc_registration_no' => 'nullable|string',
            'pci_registration_no' => 'nullable|string',
            'qualification' => 'nullable|string',
            'specialty' => 'nullable|string',
            'clinical_eligible' => 'nullable|boolean',
            'student_ratio' => 'nullable|numeric',
            'subject_specialization' => 'nullable|array',
            'research_publications' => 'nullable|string',
            'lab_supervision_eligible' => 'nullable|boolean',
            'registration_expiry_date' => 'nullable|date',
        ]);
        if (isset($data['subject_specialization'])) {
            $data['subject_specialization'] = json_encode($data['subject_specialization']);
        }
        $faculty = NursingPharmacyFaculty::create($data);
        return response()->json($faculty, 201);
    }

    public function update(Request $request, $id)
    {
        $faculty = NursingPharmacyFaculty::findOrFail($id);
        $data = $request->all();
        if (isset($data['subject_specialization']) && is_array($data['subject_specialization'])) {
            $data['subject_specialization'] = json_encode($data['subject_specialization']);
        }
        $faculty->update($data);
        return response()->json($faculty);
    }

    public function destroy($id)
    {
        $faculty = NursingPharmacyFaculty::findOrFail($id);
        $faculty->delete();
        return response()->json(null, 204);
    }
}
