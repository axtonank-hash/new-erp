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
        Schema::create('nursing_pharmacy_faculty_subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faculty_id');
            $table->unsignedBigInteger('subject_id');
            $table->string('role', 50); // teaching, theory, practical, supervision, coordination
            $table->boolean('is_primary')->default(false);
            $table->integer('student_count')->default(0);
            $table->integer('max_batch_size')->default(40);
            $table->date('assignment_date');
            $table->date('end_date')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->foreign('faculty_id')->references('id')->on('nursing_pharmacy_faculty')->onDelete('cascade');
            $table->foreign('subject_id')->references('id')->on('nursing_pharmacy_subjects')->onDelete('cascade');
            $table->unique(['faculty_id', 'subject_id']);
            $table->index('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_faculty_subjects');
    }
};
