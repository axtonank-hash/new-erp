<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_pharmacy_student_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('student_id');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->enum('document_type', [
                'marksheet_10_2',
                'migration_certificate',
                'medical_fitness',
                'inc_registration',
                'pci_registration',
                'internship_certificate',
                'research_publication',
                'lab_record',
                'clinical_logbook',
                'project_report',
                'dissertation',
                'bonafide_certificate',
                'character_certificate',
                'other'
            ]);
            
            $table->string('document_name');
            $table->string('file_path');
            $table->string('file_size');
            $table->string('mime_type');
            $table->text('description')->nullable();
            $table->date('upload_date');
            $table->date('document_date')->nullable(); // When the document was issued
            $table->date('expiry_date')->nullable(); // For time-bound documents
            $table->enum('verification_status', ['pending', 'verified', 'rejected', 'expired'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->unsignedInteger('verified_by')->nullable();
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            
            $table->integer('version')->default(1);
            $table->boolean('is_latest')->default(true);
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'document_type'], 'np_student_docs_stud_doc_type_idx');
            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_student_documents');
    }
};
