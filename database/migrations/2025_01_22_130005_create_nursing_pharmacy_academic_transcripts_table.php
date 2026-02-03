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
        Schema::create('nursing_pharmacy_academic_transcripts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_profile_id')->unique();
            $table->unsignedBigInteger('program_id');
            
            // Cumulative Performance
            $table->decimal('cumulative_gpa', 3, 2)->default(0);
            $table->decimal('cumulative_percentage', 5, 2)->default(0);
            $table->integer('total_credits_earned')->default(0);
            $table->integer('total_credits_required')->default(0);
            
            // Statistics
            $table->integer('total_semesters_completed')->default(0);
            $table->integer('total_subjects_passed')->default(0);
            $table->integer('total_subjects_failed')->default(0);
            $table->integer('total_backlogs')->default(0);
            $table->integer('current_backlog_count')->default(0);
            
            // Academic Standing
            $table->enum('academic_standing', ['excellent', 'good', 'satisfactory', 'poor', 'probation', 'terminated'])->default('satisfactory');
            $table->text('academic_remarks')->nullable();
            
            // Achievements
            $table->decimal('highest_sem_gpa', 3, 2)->default(0);
            $table->integer('highest_sem_number')->default(0);
            $table->integer('dean_list_count')->default(0);
            
            // Transcript Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_updated_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->foreign('student_profile_id')->references('id')->on('nursing_pharmacy_student_profiles')->onDelete('cascade');
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->index('academic_standing');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_academic_transcripts');
    }
};
