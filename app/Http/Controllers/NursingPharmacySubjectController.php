<?php

namespace App\Http\Controllers;

use App\Models\NursingPharmacySubject;
use Illuminate\Http\Request;

class NursingPharmacySubjectController extends Controller
{
    public function index()
    {
        return NursingPharmacySubject::with('program', 'curriculumEntries')->get();
    }

    public function show($id)
    {
        return NursingPharmacySubject::with('program', 'curriculumEntries')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:nursing_pharmacy_subjects,code',
            'program_id' => 'required|exists:nursing_pharmacy_programs,id',
            // ... add other fields as needed
        ]);
        $subject = NursingPharmacySubject::create($data);
        return response()->json($subject, 201);
    }

    public function update(Request $request, $id)
    {
        $subject = NursingPharmacySubject::findOrFail($id);
        $subject->update($request->all());
        return response()->json($subject);
    }

    public function destroy($id)
    {
        $subject = NursingPharmacySubject::findOrFail($id);
        $subject->delete();
        return response()->json(null, 204);
    }
}
