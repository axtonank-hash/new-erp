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
        Schema::create('nursing_pharmacy_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "B.Sc Nursing", "B.Pharm"
            $table->enum('type', ['nursing', 'pharmacy']);
            $table->string('program_type'); // ANM, GNM, BSc, D.Pharm, B.Pharm, M.Pharm, Pharm.D
            $table->integer('duration_years');
            $table->integer('duration_months')->default(0);
            $table->integer('total_intake_limit');
            $table->integer('starting_semester')->default(1);
            $table->integer('clinical_hours_required')->nullable(); // For nursing
            $table->integer('theory_hours_required')->nullable();
            $table->enum('regulatory_body', ['INC', 'PCI', 'UNIVERSITY'])->default('UNIVERSITY');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('regulatory_body');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_programs');
    }
};
