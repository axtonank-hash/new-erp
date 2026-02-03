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
        Schema::create('nursing_pharmacy_compliance_matrices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->date('audit_date');
            
            // Student Intake vs Approval
            $table->integer('approved_intake_strength')->default(0);
            $table->integer('actual_students_enrolled')->default(0);
            
            // Faculty Matrix
            $table->json('faculty_requirement'); // {type: 'principal', 'associate', 'assistant', required: X, current: Y}
            $table->integer('faculty_shortfall')->default(0);
            
            // Clinical Hours Fulfillment (Nursing)
            $table->integer('clinical_hours_required')->default(0);
            $table->integer('clinical_hours_available')->default(0);
            $table->decimal('clinical_hours_percentage', 5, 2)->default(0);
            
            // Lab Infrastructure (Pharmacy)
            $table->integer('required_lab_equipment')->default(0);
            $table->integer('available_lab_equipment')->default(0);
            
            // Library Resources
            $table->integer('required_books')->default(0);
            $table->integer('available_books')->default(0);
            $table->integer('required_journals')->default(0);
            $table->integer('available_journals')->default(0);
            
            // Documentation Status
            $table->json('required_documents'); // Array of document checklist
            $table->integer('documents_compliant')->default(0);
            $table->integer('documents_deficient')->default(0);
            
            // Overall Compliance Score
            $table->integer('overall_compliance_score')->default(0);
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->foreign('program_id')->references('id')->on('nursing_pharmacy_programs')->onDelete('cascade');
            $table->index('audit_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_compliance_matrices');
    }
};
