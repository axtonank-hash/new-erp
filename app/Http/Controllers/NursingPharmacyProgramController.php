<?php

namespace App\Http\Controllers;

use App\Models\NursingPharmacyProgram;
use Illuminate\Http\Request;

class NursingPharmacyProgramController extends Controller
{
    public function index()
    {
        return NursingPharmacyProgram::with('subjects', 'curricula')->get();
    }

    public function show($id)
    {
        return NursingPharmacyProgram::with('subjects', 'curricula')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'duration_years' => 'required|integer',
            // ... add other fields as needed
        ]);
        $program = NursingPharmacyProgram::create($data);
        return response()->json($program, 201);
    }

    public function update(Request $request, $id)
    {
        $program = NursingPharmacyProgram::findOrFail($id);
        $program->update($request->all());
        return response()->json($program);
    }

    public function destroy($id)
    {
        $program = NursingPharmacyProgram::findOrFail($id);
        $program->delete();
        return response()->json(null, 204);
    }
}
