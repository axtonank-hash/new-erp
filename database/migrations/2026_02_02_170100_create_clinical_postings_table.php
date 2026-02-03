<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_postings', function (Blueprint $table) {
            $table->id('posting_id');
            $table->unsignedInteger('student_id');
            $table->unsignedBigInteger('hospital_id');
            $table->unsignedBigInteger('department_id')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('hours_completed')->default(0);
            $table->unsignedInteger('supervisor_id')->nullable();
            $table->text('feedback')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('hospital_id')->references('id')->on('nursing_pharmacy_hospitals')->onDelete('cascade');
            $table->foreign('department_id')->references('id')->on('nursing_pharmacy_departments')->onDelete('set null');
            $table->foreign('supervisor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_postings');
    }
};
