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
        Schema::create('nursing_pharmacy_attendance_thresholds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('semester')->nullable(); // null = applies to all semesters
            
            // Minimum Percentages Required
            $table->integer('min_theory_percentage')->default(75);
            $table->integer('min_clinical_percentage')->default(80); // For nursing
            $table->integer('min_lab_percentage')->default(80); // For pharmacy
            $table->integer('min_internship_percentage')->default(90);
            $table->integer('min_seminar_percentage')->default(75);
            
            // Overall Attendance
            $table->integer('min_overall_percentage')->default(80);
            
            // Exam Eligibility Threshold
            $table->integer('min_percentage_for_exam_eligibility')->default(80);
            
            // Grace Days Allowed
            $table->integer('grace_absent_days')->default(5);
            $table->integer('grace_leave_days')->default(10);
            
            // Active Period
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->unique(['program_id', 'semester', 'effective_from'], 'np_attendance_thresholds_prog_sem_efffrom_uniq');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_attendance_thresholds');
    }
};
