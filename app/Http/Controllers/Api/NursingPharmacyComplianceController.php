<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyComplianceAudit;
use App\Models\NursingPharmacyComplianceMatrix;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NursingPharmacyComplianceController extends ApiController
{
    /**
     * List compliance audits.
     */
    public function listAudits(Request $request): JsonResponse
    {
        $query = NursingPharmacyComplianceAudit::query();

        if ($request->has('program_id')) {
            $query->where('program_id', $request->input('program_id'));
        }

        if ($request->has('audit_type')) {
            $query->where('audit_type', $request->input('audit_type'));
        }

        if ($request->has('compliance_status')) {
            $query->where('compliance_status', $request->input('compliance_status'));
        }

        $audits = $query->with('program')
            ->orderBy('audit_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return $this->successResponse($audits, 'Compliance audits retrieved successfully');
    }

    /**
     * Create compliance audit.
     */
    public function createAudit(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'program_id' => 'required|integer|exists:nursing_pharmacy_programs,id',
                'audit_type' => 'required|in:self_assessment,internal_inspection,external_inspection,regulatory_inspection',
                'audit_date' => 'required|date',
                'category' => 'required|in:student_intake,faculty_qualification,clinical_hours,lab_infrastructure,documentation,financial,infrastructure,overall',
                'deficiencies' => 'nullable|json',
                'observations' => 'nullable|json',
                'compliance_score' => 'integer|min:0|max:100',
            ]);

            $audit = NursingPharmacyComplianceAudit::create($validated);

            return $this->successResponse($audit, 'Compliance audit created successfully', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get audit details.
     */
    public function getAudit(NursingPharmacyComplianceAudit $audit): JsonResponse
    {
        $audit->load('program');

        return $this->successResponse($audit, 'Compliance audit retrieved successfully');
    }

    /**
     * Update audit with corrective actions.
     */
    public function updateAudit(Request $request, NursingPharmacyComplianceAudit $audit): JsonResponse
    {
        try {
            $validated = $request->validate([
                'corrective_actions' => 'required|string',
                'corrective_action_due_date' => 'required|date|after:today',
                'compliance_status' => 'in:compliant,partial,non_compliant,pending_action',
            ]);

            $audit->update($validated);

            return $this->successResponse($audit, 'Compliance audit updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Record corrective action completion.
     */
    public function recordCorrectionCompletion(Request $request, NursingPharmacyComplianceAudit $audit): JsonResponse
    {
        try {
            $validated = $request->validate([
                'corrective_action_taken' => 'required|string',
            ]);

            $audit->update([
                'corrective_action_taken' => $validated['corrective_action_taken'],
                'corrective_action_completed_at' => now(),
                'audit_status' => 'closed',
            ]);

            return $this->successResponse($audit, 'Corrective action recorded successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        }
    }

    /**
     * Get compliance matrix.
     */
    public function getComplianceMatrix($programId, Request $request): JsonResponse
    {
        $from_date = $request->input('from_date');
        $to_date = $request->input('to_date');

        $query = NursingPharmacyComplianceMatrix::where('program_id', $programId);

        if ($from_date) {
            $query->whereDate('audit_date', '>=', $from_date);
        }

        if ($to_date) {
            $query->whereDate('audit_date', '<=', $to_date);
        }

        $matrix = $query->orderBy('audit_date', 'desc')
            ->first();

        if (!$matrix) {
            return $this->errorResponse('No compliance matrix found for this program', 404);
        }

        return $this->successResponse(
            $matrix->getDetailedMatrix(),
            'Compliance matrix retrieved successfully'
        );
    }

    /**
     * Generate compliance report.
     */
    public function generateComplianceReport($programId): JsonResponse
    {
        $latestMatrix = NursingPharmacyComplianceMatrix::where('program_id', $programId)
            ->orderBy('audit_date', 'desc')
            ->first();

        $audits = NursingPharmacyComplianceAudit::where('program_id', $programId)
            ->orderBy('audit_date', 'desc')
            ->limit(10)
            ->get();

        $report = [
            'program_id' => $programId,
            'latest_matrix' => $latestMatrix?->getDetailedMatrix(),
            'recent_audits' => $audits->map(fn($a) => $a->getSummary()),
            'compliance_trend' => $this->calculateComplianceTrend($audits),
        ];

        return $this->successResponse($report, 'Compliance report generated successfully');
    }

    /**
     * Calculate compliance trend.
     */
    private function calculateComplianceTrend($audits): array
    {
        $trend = [];
        foreach ($audits as $audit) {
            $trend[] = [
                'date' => $audit->audit_date,
                'score' => $audit->compliance_score,
                'status' => $audit->compliance_status,
            ];
        }

        return $trend;
    }

    /**
     * Export compliance checklist.
     */
    public function exportChecklist($programId): JsonResponse
    {
        $matrix = NursingPharmacyComplianceMatrix::where('program_id', $programId)
            ->orderBy('audit_date', 'desc')
            ->first();

        if (!$matrix) {
            return $this->errorResponse('No compliance data available', 404);
        }

        $checklist = [
            'student_intake' => [
                'approved' => $matrix->approved_intake_strength,
                'actual' => $matrix->actual_students_enrolled,
                'compliant' => $matrix->actual_students_enrolled <= $matrix->approved_intake_strength,
            ],
            'faculty' => $matrix->faculty_requirement,
            'clinical_hours' => [
                'required' => $matrix->clinical_hours_required,
                'available' => $matrix->clinical_hours_available,
                'percentage' => $matrix->clinical_hours_percentage,
                'compliant' => $matrix->clinical_hours_percentage >= 80,
            ],
            'library_resources' => [
                'books_compliant' => $matrix->available_books >= $matrix->required_books,
                'journals_compliant' => $matrix->available_journals >= $matrix->required_journals,
            ],
            'documents' => [
                'compliant_count' => $matrix->documents_compliant,
                'deficient_count' => $matrix->documents_deficient,
            ],
        ];

        return $this->successResponse($checklist, 'Compliance checklist exported successfully');
    }
}
