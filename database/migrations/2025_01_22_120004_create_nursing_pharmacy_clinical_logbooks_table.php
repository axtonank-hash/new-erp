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
        Schema::create('nursing_pharmacy_clinical_logbooks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_profile_id');
            $table->unsignedBigInteger('clinical_posting_id');
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->date('entry_date');
            
            // Procedure Details
            $table->string('procedure_name', 255);
            $table->text('procedure_description');
            $table->string('ward', 100)->nullable();
            $table->string('patient_category', 100)->nullable();
            
            // Competency Checklist
            $table->json('competencies_checklist'); // Array of procedures with status
            $table->integer('competencies_completed')->default(0);
            $table->integer('competencies_total')->default(0);
            
            // Observations & Learning
            $table->text('observations');
            $table->text('learning_points')->nullable();
            $table->text('challenges')->nullable();
            $table->text('achievements')->nullable();
            
            // Supervisor Feedback
            $table->unsignedInteger('supervisor_id')->nullable();
            $table->text('supervisor_feedback')->nullable();
            $table->enum('supervisor_rating', ['excellent', 'good', 'satisfactory', 'needs_improvement', 'pending'])->default('pending');
            $table->timestamp('supervisor_approved_at')->nullable();
            
            // Status
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->text('rejection_reason')->nullable();
            
            // Lockdown
            $table->boolean('is_locked')->default(false);
            $table->timestamp('locked_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('student_profile_id')->references('id')->on('nursing_pharmacy_student_profiles')->onDelete('cascade');
            $table->foreign('clinical_posting_id')->references('id')->on('nursing_pharmacy_clinical_postings')->onDelete('cascade');
            $table->foreign('faculty_id')->references('id')->on('nursing_pharmacy_faculty')->onDelete('set null');
            $table->foreign('supervisor_id')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['student_profile_id', 'entry_date'], 'np_clinical_logbooks_studprof_entry_uniq');
            $table->index(['status', 'supervisor_rating'], 'np_clinical_logbooks_status_supvr_idx');
            $table->index('is_locked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_clinical_logbooks');
    }
};
