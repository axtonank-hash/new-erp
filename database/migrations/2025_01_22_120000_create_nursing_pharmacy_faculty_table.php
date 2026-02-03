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
        Schema::create('nursing_pharmacy_faculty', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('faculty_code', 50)->unique();
            
            // INC/PCI Registration
            $table->string('inc_registration_no', 100)->nullable()->unique();
            $table->string('pci_registration_no', 100)->nullable()->unique();
            $table->date('registration_expiry_date')->nullable();
            
            // Qualification & Specialty
            $table->string('highest_qualification', 100);
            $table->string('specialty', 255)->nullable();
            $table->string('sub_specialty', 255)->nullable();
            
            // Eligibility
            $table->boolean('clinical_eligible')->default(false);
            $table->boolean('lab_supervision_eligible')->default(false);
            $table->boolean('theory_eligible')->default(true);
            
            // Faculty Type
            $table->enum('faculty_type', ['permanent', 'contractual', 'visiting', 'guest'])->default('contractual');
            $table->enum('department', ['nursing', 'pharmacy', 'both'])->default('nursing');
            
            // Student Ratio
            $table->integer('current_student_load')->default(0);
            $table->integer('max_student_load')->default(40);
            
            // Research & Publications
            $table->integer('research_publications')->default(0);
            $table->string('research_areas', 500)->nullable();
            $table->boolean('has_phd')->default(false);
            
            // Contact & Address
            $table->string('phone', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->date('joining_date');
            $table->date('separation_date')->nullable();
            
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('user_id');
            $table->index('faculty_code');
            $table->index('is_active');
            $table->index('department');
            $table->index('faculty_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_faculty');
    }
};
