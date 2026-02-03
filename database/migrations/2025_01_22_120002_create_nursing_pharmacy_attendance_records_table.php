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
        Schema::create('nursing_pharmacy_attendance_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_profile_id');
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->date('attendance_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            
            // Attendance Type
            $table->enum('attendance_type', ['theory', 'clinical', 'lab', 'internship', 'project', 'seminar'])->default('theory');
            $table->enum('status', ['present', 'absent', 'leave', 'excused_absence', 'half_day'])->default('absent');
            
            // Context
            $table->unsignedBigInteger('ward_id')->nullable(); // For nursing clinical
            $table->unsignedBigInteger('department_id')->nullable(); // For nursing/pharmacy
            $table->unsignedBigInteger('lab_id')->nullable(); // For pharmacy labs
            $table->unsignedBigInteger('hospital_id')->nullable(); // For clinical posting
            
            // Duration
            $table->decimal('hour_duration', 5, 2)->default(1.00);
            
            // Marks (for lab/practical)
            $table->decimal('marks_obtained', 5, 2)->nullable();
            $table->decimal('marks_total', 5, 2)->nullable();
            
            // Remarks
            $table->text('remarks')->nullable();
            $table->string('leave_reason', 255)->nullable();
            
            // Status & Approval
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->unsignedInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->foreign('student_profile_id')->references('id')->on('nursing_pharmacy_student_profiles')->onDelete('cascade');
            $table->foreign('faculty_id')->references('id')->on('nursing_pharmacy_faculty')->onDelete('set null');
            $table->foreign('department_id')->references('id')->on('nursing_pharmacy_departments')->onDelete('set null');
            $table->foreign('hospital_id')->references('id')->on('nursing_pharmacy_hospitals')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['student_profile_id', 'attendance_date'], 'np_attendance_studprof_date_idx');
            $table->index(['attendance_type', 'status']);
            $table->index('approval_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_attendance_records');
    }
};
