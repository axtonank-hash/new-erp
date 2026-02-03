<?php

namespace App\Http\Controllers;

use App\Models\ClinicalPosting;
use Illuminate\Http\Request;

class ClinicalPostingController extends Controller
{
    public function index()
    {
        return ClinicalPosting::with(['student', 'hospital', 'department', 'supervisor'])->get();
    }

    public function show($id)
    {
        return ClinicalPosting::with(['student', 'hospital', 'department', 'supervisor'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'hospital_id' => 'required|exists:nursing_pharmacy_hospitals,id',
            'department_id' => 'nullable|exists:nursing_pharmacy_departments,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'hours_completed' => 'nullable|integer',
            'supervisor_id' => 'nullable|exists:users,id',
            'feedback' => 'nullable|string',
            'status' => 'nullable|string',
        ]);
        $posting = ClinicalPosting::create($data);
        return response()->json($posting, 201);
    }

    public function update(Request $request, $id)
    {
        $posting = ClinicalPosting::findOrFail($id);
        $posting->update($request->all());
        return response()->json($posting);
    }

    public function destroy($id)
    {
        $posting = ClinicalPosting::findOrFail($id);
        $posting->delete();
        return response()->json(null, 204);
    }
}
