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
        Schema::create('nursing_pharmacy_curricula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('nursing_pharmacy_programs')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('nursing_pharmacy_subjects')->onDelete('cascade');
            $table->integer('academic_year');
            $table->integer('sequence')->comment('Order of subject in curriculum');
            $table->boolean('batch_specific')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->unsignedInteger('locked_by')->nullable();
            $table->foreign('locked_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamp('locked_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['program_id', 'subject_id', 'academic_year'], 'np_curricula_pid_sid_ay_unique');
            $table->index(['program_id', 'academic_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_curricula');
    }
};
