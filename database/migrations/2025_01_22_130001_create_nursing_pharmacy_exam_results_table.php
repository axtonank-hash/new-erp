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
        Schema::create('nursing_pharmacy_exam_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('examination_id');
            $table->unsignedBigInteger('student_profile_id');
            
            // Marks
            $table->decimal('internal_marks', 5, 2)->nullable();
            $table->decimal('practical_marks', 5, 2)->nullable();
            $table->decimal('external_marks', 5, 2)->nullable();
            $table->decimal('total_marks', 5, 2)->nullable();
            
            // Result Status
            $table->enum('result_status', ['pass', 'fail', 'absent', 'withheld'])->default('absent');
            $table->string('grade', 2)->nullable(); // A, B, C, etc.
            $table->decimal('grade_points', 3, 2)->nullable();
            
            // Grace Marks
            $table->decimal('grace_marks_applied', 5, 2)->default(0);
            $table->text('grace_marks_reason')->nullable();
            
            // Supplementary Details
            $table->boolean('is_supplementary')->default(false);
            $table->date('supplementary_date')->nullable();
            $table->decimal('supplementary_marks', 5, 2)->nullable();
            $table->enum('supplementary_status', ['pass', 'fail', 'pending'])->nullable();
            
            // Backlog
            $table->boolean('is_backlog')->default(false);
            $table->integer('backlog_count')->default(0);
            
            // Review & Recheck
            $table->boolean('is_rechecked')->default(false);
            $table->decimal('rechecked_marks', 5, 2)->nullable();
            $table->timestamp('rechecked_at')->nullable();
            
            // Additional Info
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->foreign('examination_id')->references('id')->on('nursing_pharmacy_examinations')->onDelete('cascade');
            $table->foreign('student_profile_id')->references('id')->on('nursing_pharmacy_student_profiles')->onDelete('cascade');
            $table->unique(['examination_id', 'student_profile_id'], 'np_examresults_exam_stud_uniq');
            $table->index('result_status');
            $table->index('is_backlog');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_exam_results');
    }
};
