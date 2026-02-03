<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Result;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResultController extends Controller
{
    public function index(): JsonResponse
    {
        $results = Result::all();
        return response()->json(['success' => true, 'data' => $results]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|integer',
            'exam_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'internal_marks' => 'nullable|integer',
            'practical_marks' => 'nullable|integer',
            'external_marks' => 'nullable|integer',
            'total_marks' => 'required|integer',
            'grade' => 'required|string',
            'status' => 'required|in:pass,fail,backlog',
            'is_supplementary' => 'boolean',
            'supplementary_date' => 'nullable|date',
        ]);
        $result = Result::create($validated);
        return response()->json(['success' => true, 'data' => $result], 201);
    }

    public function show($id): JsonResponse
    {
        $result = Result::findOrFail($id);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $result = Result::findOrFail($id);
        $validated = $request->validate([
            'student_id' => 'sometimes|integer',
            'exam_id' => 'sometimes|integer',
            'subject_id' => 'sometimes|integer',
            'internal_marks' => 'nullable|integer',
            'practical_marks' => 'nullable|integer',
            'external_marks' => 'nullable|integer',
            'total_marks' => 'sometimes|integer',
            'grade' => 'sometimes|string',
            'status' => 'sometimes|in:pass,fail,backlog',
            'is_supplementary' => 'boolean',
            'supplementary_date' => 'nullable|date',
        ]);
        $result->update($validated);
        return response()->json(['success' => true, 'data' => $result]);
    }

    public function destroy($id): JsonResponse
    {
        $result = Result::findOrFail($id);
        $result->delete();
        return response()->json(['success' => true]);
    }
}
