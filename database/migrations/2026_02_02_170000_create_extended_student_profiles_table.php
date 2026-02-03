<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extended_student_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('student_id')->unique();
            $table->string('nursing_registration_no')->nullable();
            $table->string('pharmacy_registration_no')->nullable();
            $table->unsignedBigInteger('current_clinical_posting')->nullable();
            $table->integer('clinical_hours_completed')->default(0);
            $table->unsignedBigInteger('latest_ward_rotation')->nullable();
            $table->unsignedBigInteger('hospital_id')->nullable();
            $table->integer('lab_practical_hours')->default(0);
            $table->string('industrial_training_status')->nullable();
            $table->string('project_status')->nullable();
            $table->string('dissertation_link')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('hospital_id')->references('id')->on('nursing_pharmacy_hospitals')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('extended_student_profiles');
    }
};
