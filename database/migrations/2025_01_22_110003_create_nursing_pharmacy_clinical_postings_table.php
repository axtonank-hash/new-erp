<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_pharmacy_clinical_postings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('student_id');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('hospital_id')->constrained('nursing_pharmacy_hospitals')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('nursing_pharmacy_departments')->onDelete('cascade');
            $table->unsignedInteger('supervisor_id')->nullable();
            $table->foreign('supervisor_id')->references('id')->on('users')->onDelete('set null');
            
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('hours_completed')->default(0);
            $table->integer('target_hours');
            $table->text('supervisor_feedback')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'])->default('scheduled');
            $table->decimal('performance_rating', 3, 2)->nullable(); // 0-5 rating
            
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
              $table->index(['hospital_id', 'department_id'], 'np_clinical_postings_hosp_dept_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_clinical_postings');
    }
};
