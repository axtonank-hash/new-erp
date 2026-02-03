<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_pharmacy_departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hospital_id')->constrained('nursing_pharmacy_hospitals')->onDelete('cascade');
            $table->string('name');
            $table->string('code');
            $table->string('head_name')->nullable();
            $table->string('head_phone')->nullable();
            $table->integer('bed_strength')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['hospital_id', 'code']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_departments');
    }
};
