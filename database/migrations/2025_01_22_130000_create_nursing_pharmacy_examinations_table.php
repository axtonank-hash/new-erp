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
        Schema::create('nursing_pharmacy_examinations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('semester');
            
            // Exam Details
            $table->string('exam_name', 255);
            $table->enum('exam_type', ['internal_theory', 'internal_practical', 'university_theory', 'university_practical', 'sessional', 'viva', 'project_evaluation'])->default('internal_theory');
            $table->date('exam_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('exam_venue', 255)->nullable();
            
            // Marks Configuration
            $table->integer('max_marks')->default(100);
            $table->integer('passing_marks')->default(40);
            $table->integer('internal_weight_percentage')->default(30);
            $table->integer('external_weight_percentage')->default(70);
            
            // Exam Status
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'])->default('scheduled');
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('nursing_pharmacy_subjects')->onDelete('cascade');
            $table->index(['exam_date', 'exam_type']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_examinations');
    }
};
