<?php

namespace App\Http\Controllers;

use App\Models\NursingPharmacyCurriculum;
use Illuminate\Http\Request;

class NursingPharmacyCurriculumController extends Controller
{
    public function index()
    {
        return NursingPharmacyCurriculum::with('program', 'subject')->get();
    }

    public function show($id)
    {
        return NursingPharmacyCurriculum::with('program', 'subject')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'program_id' => 'required|exists:nursing_pharmacy_programs,id',
            'subject_id' => 'required|exists:nursing_pharmacy_subjects,id',
            'academic_year' => 'required|integer',
            'sequence' => 'required|integer',
            // ... add other fields as needed
        ]);
        $curriculum = NursingPharmacyCurriculum::create($data);
        return response()->json($curriculum, 201);
    }

    public function update(Request $request, $id)
    {
        $curriculum = NursingPharmacyCurriculum::findOrFail($id);
        $curriculum->update($request->all());
        return response()->json($curriculum);
    }

    public function destroy($id)
    {
        $curriculum = NursingPharmacyCurriculum::findOrFail($id);
        $curriculum->delete();
        return response()->json(null, 204);
    }
}
