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
        Schema::create('programs', function (Blueprint $table) {
            $table->id('program_id');
            $table->string('name');
            $table->enum('type', ['nursing', 'pharmacy']);
            $table->string('program_type'); // ANM/GNM/BSc/etc
            $table->integer('duration_years');
            $table->integer('duration_months')->default(0);
            $table->integer('total_intake_limit');
            $table->integer('starting_semester')->nullable();
            $table->integer('clinical_hours_required')->nullable();
            $table->integer('theory_hours_required')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
