<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nursing_pharmacy_compliance_audits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            
            // Audit Details
            $table->enum('audit_type', ['self_assessment', 'internal_inspection', 'external_inspection', 'regulatory_inspection'])->default('self_assessment');
            $table->date('audit_date');
            $table->unsignedBigInteger('auditor_id')->nullable(); // Faculty/Staff ID
            
            // Compliance Categories
            $table->enum('category', ['student_intake', 'faculty_qualification', 'clinical_hours', 'lab_infrastructure', 'documentation', 'financial', 'infrastructure', 'overall'])->default('overall');
            
            // Audit Results
            $table->enum('compliance_status', ['compliant', 'partial', 'non_compliant', 'pending_action'])->default('pending_action');
            $table->integer('compliance_score')->default(0); // 0-100
            
            // Findings
            $table->json('deficiencies'); // Array of deficiency items
            $table->json('observations')->nullable();
            
            // Action Plan
            $table->text('corrective_actions')->nullable();
            $table->date('corrective_action_due_date')->nullable();
            $table->text('corrective_action_taken')->nullable();
            $table->timestamp('corrective_action_completed_at')->nullable();
            
            // Documentation
            $table->text('remarks')->nullable();
            $table->string('attachment_path', 255)->nullable();
            
            // Status
            $table->enum('audit_status', ['open', 'closed', 'escalated'])->default('open');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->index(['audit_date', 'audit_type']);
            $table->index(['compliance_status', 'audit_status'], 'np_compliance_audits_status_audit_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_compliance_audits');
    }
};
