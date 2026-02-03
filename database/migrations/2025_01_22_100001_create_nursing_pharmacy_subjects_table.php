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
        Schema::create('nursing_pharmacy_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('nursing_pharmacy_programs')->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->integer('semester');
            $table->integer('credit_hours')->nullable(); // For pharmacy
            $table->integer('theory_hours')->default(0);
            $table->integer('practical_hours')->default(0);
            $table->boolean('is_mandatory')->default(true);
            $table->enum('regulatory_body', ['INC', 'PCI', 'UNIVERSITY'])->default('UNIVERSITY');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['program_id', 'semester']);
            $table->index('regulatory_body');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_subjects');
    }
};
