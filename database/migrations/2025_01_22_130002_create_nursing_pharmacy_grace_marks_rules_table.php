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
        Schema::create('nursing_pharmacy_grace_marks_rules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->string('rule_name', 255);
            $table->text('description')->nullable();
            
            // Eligibility Criteria
            $table->decimal('min_marks_percentage', 5, 2)->default(35);
            $table->integer('max_grace_marks')->default(5);
            $table->integer('max_application_count')->default(1);
            
            // Conditions
            $table->json('applicable_exam_types'); // ['internal_theory', 'sessional']
            $table->json('applicable_semesters')->nullable(); // null = all
            $table->boolean('is_active')->default(true);
            
            // Effective Period
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_grace_marks_rules');
    }
};
