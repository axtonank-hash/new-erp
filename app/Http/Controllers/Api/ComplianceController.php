<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplianceReport;
use App\Models\ComplianceAudit;
use App\Models\ComplianceMatrix;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplianceController extends Controller
{
    // Compliance Reports
    public function listReports(): JsonResponse
    {
        $reports = ComplianceReport::all();
        return response()->json(['success' => true, 'data' => $reports]);
    }

    public function createReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => 'required|string',
            'program_id' => 'nullable|integer',
            'semester' => 'nullable|integer',
            'data' => 'required',
            'report_date' => 'required|date',
            'status' => 'string',
        ]);
        $report = ComplianceReport::create($validated);
        return response()->json(['success' => true, 'data' => $report], 201);
    }

    // Compliance Audits
    public function listAudits(): JsonResponse
    {
        $audits = ComplianceAudit::all();
        return response()->json(['success' => true, 'data' => $audits]);
    }

    public function createAudit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'audit_type' => 'required|string',
            'audit_date' => 'required|date',
            'auditor_id' => 'nullable|integer',
            'compliance_status' => 'required|string',
            'compliance_score' => 'nullable|numeric',
            'audit_status' => 'string',
            'findings' => 'nullable',
            'actions' => 'nullable',
        ]);
        $audit = ComplianceAudit::create($validated);
        return response()->json(['success' => true, 'data' => $audit], 201);
    }

    // Compliance Matrices
    public function listMatrices(): JsonResponse
    {
        $matrices = ComplianceMatrix::all();
        return response()->json(['success' => true, 'data' => $matrices]);
    }

    public function createMatrix(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'matrix_type' => 'required|string',
            'matrix_data' => 'required',
            'effective_date' => 'required|date',
        ]);
        $matrix = ComplianceMatrix::create($validated);
        return response()->json(['success' => true, 'data' => $matrix], 201);
    }
}
