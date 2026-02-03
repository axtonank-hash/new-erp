<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_pharmacy_student_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('student_id');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('program_id')->constrained('nursing_pharmacy_programs')->onDelete('cascade');
            $table->string('registration_number')->unique()->nullable();
            
            // Nursing specific fields
            $table->string('inc_registration_number')->unique()->nullable();
            $table->integer('clinical_hours_completed')->default(0);
            $table->unsignedBigInteger('current_hospital_id')->nullable(); // FK constraint commented out for migration order
            $table->unsignedBigInteger('current_department_id')->nullable(); // FK constraint commented out for migration order
            $table->date('latest_ward_rotation_start')->nullable();
            $table->date('latest_ward_rotation_end')->nullable();
            
            // Pharmacy specific fields
            $table->string('pci_registration_number')->unique()->nullable();
            $table->integer('lab_practical_hours')->default(0);
            $table->integer('industrial_training_hours')->default(0);
            $table->enum('industrial_training_status', ['not_started', 'in_progress', 'completed', 'pending_approval'])->default('not_started');
            $table->enum('project_status', ['not_started', 'in_progress', 'submitted', 'approved', 'rejected'])->default('not_started');
            $table->text('dissertation_link')->nullable();
            $table->text('project_title')->nullable();
            
            // Common fields
            $table->text('clinical_summary')->nullable();
            $table->boolean('eligible_for_exam')->default(false);
            $table->date('eligibility_check_date')->nullable();
            $table->text('eligibility_notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'program_id']);
            $table->index('eligible_for_exam');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_student_profiles');
    }
};
