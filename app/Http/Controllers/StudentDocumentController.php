<?php

namespace App\Http\Controllers;

use App\Models\StudentDocument;
use Illuminate\Http\Request;

class StudentDocumentController extends Controller
{
    public function index()
    {
        return StudentDocument::with('student')->get();
    }

    public function show($id)
    {
        return StudentDocument::with('student')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'document_type' => 'required|string',
            'file_path' => 'required|string',
            'status' => 'nullable|string',
        ]);
        $doc = StudentDocument::create($data);
        return response()->json($doc, 201);
    }

    public function update(Request $request, $id)
    {
        $doc = StudentDocument::findOrFail($id);
        $doc->update($request->all());
        return response()->json($doc);
    }

    public function destroy($id)
    {
        $doc = StudentDocument::findOrFail($id);
        $doc->delete();
        return response()->json(null, 204);
    }
}
