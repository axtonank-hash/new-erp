<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class NursingPharmacyStudentDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nursing_pharmacy_student_documents';

    protected $fillable = [
        'student_id',
        'document_type',
        'document_name',
        'file_path',
        'file_size',
        'mime_type',
        'description',
        'upload_date',
        'document_date',
        'expiry_date',
        'verification_status',
        'verification_notes',
        'verified_by',
        'verified_at',
        'version',
        'is_latest',
    ];

    protected $casts = [
        'upload_date' => 'date',
        'document_date' => 'date',
        'expiry_date' => 'date',
        'verified_at' => 'datetime',
        'version' => 'integer',
        'is_latest' => 'boolean',
    ];

    /**
     * Get the student.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the verifier user.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Check if document is expired.
     */
    public function isExpired(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }

        return $this->expiry_date->isPast();
    }

    /**
     * Get document status with expiry info.
     */
    public function getStatus(): array
    {
        $status = [
            'verification_status' => $this->verification_status,
            'is_expired' => $this->isExpired(),
            'actual_status' => $this->verification_status,
        ];

        if ($this->isExpired()) {
            $status['actual_status'] = 'expired';
        }

        return $status;
    }

    /**
     * Verify the document.
     */
    public function verify(int $userId, string $notes = ''): bool
    {
        $this->update([
            'verification_status' => 'verified',
            'verified_by' => $userId,
            'verified_at' => now(),
            'verification_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Reject the document.
     */
    public function reject(int $userId, string $notes): bool
    {
        $this->update([
            'verification_status' => 'rejected',
            'verified_by' => $userId,
            'verified_at' => now(),
            'verification_notes' => $notes,
        ]);

        return true;
    }

    /**
     * Mark as expired.
     */
    public function markExpired(): bool
    {
        $this->update([
            'verification_status' => 'expired',
        ]);

        return true;
    }

    /**
     * Archive current version and create new version.
     */
    public function createNewVersion(string $newFilePath, int $fileSize, string $mimeType): NursingPharmacyStudentDocument
    {
        // Mark current as not latest
        $this->update(['is_latest' => false]);

        // Create new version
        return static::create([
            'student_id' => $this->student_id,
            'document_type' => $this->document_type,
            'document_name' => $this->document_name,
            'file_path' => $newFilePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'description' => $this->description,
            'upload_date' => now()->toDateString(),
            'document_date' => $this->document_date,
            'expiry_date' => $this->expiry_date,
            'verification_status' => 'pending',
            'version' => $this->version + 1,
            'is_latest' => true,
        ]);
    }

    /**
     * Get document preview info.
     */
    public function getPreviewInfo(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->document_type,
            'name' => $this->document_name,
            'uploaded_on' => $this->upload_date,
            'document_dated' => $this->document_date,
            'expires_on' => $this->expiry_date,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'status' => $this->getStatus(),
            'version' => $this->version,
            'verified_by' => $this->verifier?->name,
            'verified_on' => $this->verified_at,
        ];
    }
}
