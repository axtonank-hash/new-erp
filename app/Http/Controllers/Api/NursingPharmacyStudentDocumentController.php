<?php

namespace App\Http\Controllers\Api;

use App\Models\NursingPharmacyStudentDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class NursingPharmacyStudentDocumentController extends ApiController
{
    /**
     * Get student documents.
     */
    public function index(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id');
        $documentType = $request->input('document_type');

        $query = NursingPharmacyStudentDocument::where('student_id', $studentId)
            ->where('is_latest', true);

        if ($documentType) {
            $query->where('document_type', $documentType);
        }

        $documents = $query->orderByDesc('updated_at')
            ->paginate($request->input('per_page', 20));

        return $this->successResponse($documents, 'Documents retrieved successfully');
    }

    /**
     * Upload document.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:users,id',
                'document_type' => 'required|in:marksheet_10_2,migration_certificate,medical_fitness,inc_registration,pci_registration,internship_certificate,research_publication,lab_record,clinical_logbook,project_report,dissertation,bonafide_certificate,character_certificate,other',
                'document_file' => 'required|file|max:10240', // 10MB
                'document_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'document_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:document_date',
            ]);

            // Store file
            $file = $request->file('document_file');
            $filePath = $file->store('student-documents/' . $validated['student_id'], 'private');

            // Check if document type already exists for student
            $existing = NursingPharmacyStudentDocument::where('student_id', $validated['student_id'])
                ->where('document_type', $validated['document_type'])
                ->where('is_latest', true)
                ->first();

            // Create new document
            $document = NursingPharmacyStudentDocument::create([
                'student_id' => $validated['student_id'],
                'document_type' => $validated['document_type'],
                'document_name' => $validated['document_name'],
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'description' => $validated['description'] ?? null,
                'upload_date' => now()->toDateString(),
                'document_date' => $validated['document_date'] ?? null,
                'expiry_date' => $validated['expiry_date'] ?? null,
                'version' => ($existing?->version ?? 0) + 1,
                'is_latest' => true,
            ]);

            // Archive old version
            if ($existing) {
                $existing->update(['is_latest' => false]);
            }

            return $this->successResponse(
                $document->getPreviewInfo(),
                'Document uploaded successfully',
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationError($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                ['upload' => $e->getMessage()],
                'Failed to upload document',
                500
            );
        }
    }

    /**
     * Get document preview.
     */
    public function show(NursingPharmacyStudentDocument $document): JsonResponse
    {
        return $this->successResponse(
            $document->getPreviewInfo(),
            'Document retrieved successfully'
        );
    }

    /**
     * Download document.
     */
    public function download(NursingPharmacyStudentDocument $document)
    {
        if (!Storage::disk('private')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->document_name
        );
    }

    /**
     * Verify document.
     */
    public function verify(Request $request, NursingPharmacyStudentDocument $document): JsonResponse
    {
        try {
            $validated = $request->validate([
                'verification_notes' => 'nullable|string',
            ]);

            $document->verify($request->user()->id, $validated['verification_notes'] ?? '');

            return $this->successResponse(
                $document->getPreviewInfo(),
                'Document verified successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                ['verification' => $e->getMessage()],
                'Failed to verify document',
                500
            );
        }
    }

    /**
     * Reject document.
     */
    public function reject(Request $request, NursingPharmacyStudentDocument $document): JsonResponse
    {
        try {
            $validated = $request->validate([
                'rejection_reason' => 'required|string',
            ]);

            $document->reject($request->user()->id, $validated['rejection_reason']);

            return $this->successResponse(
                $document->getPreviewInfo(),
                'Document rejected successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                ['rejection' => $e->getMessage()],
                'Failed to reject document',
                500
            );
        }
    }

    /**
     * Get document history (all versions).
     */
    public function getHistory(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id');
        $documentType = $request->input('document_type');

        $query = NursingPharmacyStudentDocument::where('student_id', $studentId);

        if ($documentType) {
            $query->where('document_type', $documentType);
        }

        $documents = $query->orderByDesc('version')
            ->get()
            ->map(function ($doc) {
                return $doc->getPreviewInfo();
            });

        return $this->successResponse($documents, 'Document history retrieved successfully');
    }

    /**
     * Get compliance verification status.
     */
    public function getComplianceStatus(Request $request): JsonResponse
    {
        $studentId = $request->input('student_id');
        $programType = $request->input('program_type', 'nursing');

        $documents = NursingPharmacyStudentDocument::where('student_id', $studentId)
            ->where('is_latest', true)
            ->get();

        $requiredDocs = $programType === 'nursing'
            ? ['medical_fitness', 'inc_registration']
            : ['pci_registration'];

        $compliance = [];
        foreach ($requiredDocs as $docType) {
            $doc = $documents->firstWhere('document_type', $docType);
            $compliance[$docType] = [
                'required' => true,
                'present' => (bool)$doc,
                'status' => $doc?->verification_status ?? 'missing',
                'is_expired' => $doc?->isExpired() ?? false,
            ];
        }

        $allComplete = collect($compliance)->every(function ($item) {
            return $item['present'] && $item['status'] === 'verified' && !$item['is_expired'];
        });

        return $this->successResponse([
            'compliance_status' => $allComplete ? 'complete' : 'incomplete',
            'documents' => $compliance,
        ], 'Compliance status retrieved successfully');
    }

    /**
     * Delete document.
     */
    public function destroy(NursingPharmacyStudentDocument $document): JsonResponse
    {
        try {
            Storage::disk('private')->delete($document->file_path);
            $document->delete();

            return $this->successResponse(null, 'Document deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(
                ['deletion' => $e->getMessage()],
                'Failed to delete document',
                500
            );
        }
    }

    /**
     * Bulk verify documents.
     */
    public function bulkVerify(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'document_ids' => 'required|array|min:1',
                'document_ids.*' => 'exists:nursing_pharmacy_student_documents,id',
            ]);

            $documents = NursingPharmacyStudentDocument::whereIn('id', $validated['document_ids'])->get();
            $userId = $request->user()->id;

            foreach ($documents as $doc) {
                $doc->verify($userId, 'Bulk verified');
            }

            return $this->successResponse(
                ['verified_count' => $documents->count()],
                'Documents verified successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                ['bulk_verify' => $e->getMessage()],
                'Bulk verification failed',
                500
            );
        }
    }
}
