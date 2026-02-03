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
        Schema::create('curriculum', function (Blueprint $table) {
            $table->id('curriculum_id');
            $table->unsignedBigInteger('program_id');
            $table->string('academic_year');
            $table->unsignedBigInteger('subject_id');
            $table->integer('sequence')->nullable();
            $table->boolean('batch_specific')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedBigInteger('locked_by')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->foreign('program_id')->references('program_id')->on('programs')->onDelete('cascade');
            // subject_id foreign key can be added if subjects table is finalized
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum');
    }
};
