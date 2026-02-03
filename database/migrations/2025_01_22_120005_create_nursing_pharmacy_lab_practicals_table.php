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
        Schema::create('nursing_pharmacy_lab_practicals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('faculty_id')->nullable();
            
            // Lab/Practical Schedule
            $table->string('lab_name', 255);
            $table->date('practical_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('batch_number')->default(1);
            $table->integer('batch_size')->default(20);
            
            // Equipment & Setup
            $table->json('equipment_used'); // Array of equipment
            $table->text('setup_requirements')->nullable();
            $table->text('safety_precautions')->nullable();
            
            // Practical Details
            $table->string('practical_title', 255);
            $table->text('practical_objective');
            $table->text('procedure_steps');
            $table->text('expected_outcomes')->nullable();
            
            // Assessment
            $table->integer('total_marks')->default(50);
            $table->integer('internal_marks')->default(30);
            $table->integer('external_marks')->default(20);
            $table->text('evaluation_criteria')->nullable();
            
            // Attendance
            $table->integer('students_expected')->default(0);
            $table->integer('students_present')->default(0);
            
            // Status
            $table->enum('status', ['planned', 'scheduled', 'in_progress', 'completed', 'cancelled'])->default('planned');
            $table->timestamp('completed_at')->nullable();
            
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('nursing_pharmacy_subjects')->onDelete('cascade');
            $table->foreign('faculty_id')->references('id')->on('nursing_pharmacy_faculty')->onDelete('set null');
            
            $table->index(['practical_date', 'batch_number'], 'np_labpracticals_date_batch_idx');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_lab_practicals');
    }
};
