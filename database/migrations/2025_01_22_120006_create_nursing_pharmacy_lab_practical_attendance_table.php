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
        Schema::create('nursing_pharmacy_lab_practical_attendance', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lab_practical_id');
            $table->unsignedBigInteger('student_profile_id');
            
            // Attendance & Marks
            $table->enum('status', ['present', 'absent', 'excused'])->default('present');
            $table->decimal('marks_obtained', 5, 2)->nullable();
            $table->text('performance_notes')->nullable();
            
            // Equipment Proficiency
            $table->json('equipment_proficiency'); // Array with proficiency levels
            $table->text('technique_assessment')->nullable();
            
            // Faculty Feedback
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->text('faculty_feedback')->nullable();
            $table->enum('faculty_rating', ['excellent', 'good', 'satisfactory', 'needs_improvement', 'absent'])->default('absent');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('lab_practical_id', 'np_labpract_attend_labpract_fk')->references('id')->on('nursing_pharmacy_lab_practicals')->onDelete('cascade');
            $table->foreign('student_profile_id', 'np_labpract_attend_studprof_fk')->references('id')->on('nursing_pharmacy_student_profiles')->onDelete('cascade');
            $table->foreign('faculty_id')->references('id')->on('nursing_pharmacy_faculty')->onDelete('set null');
            
            $table->unique(['lab_practical_id', 'student_profile_id'], 'np_labpract_attend_lab_stud_uniq');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_lab_practical_attendance');
    }
};
