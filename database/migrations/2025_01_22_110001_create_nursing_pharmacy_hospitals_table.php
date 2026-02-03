<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nursing_pharmacy_hospitals', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('pin_code');
            $table->string('phone');
            $table->string('email')->unique();
            $table->string('principal_contact')->nullable();
            $table->string('principal_phone')->nullable();
            $table->integer('total_bed_strength')->default(0);
            $table->text('specialties')->nullable(); // JSON array of specialties
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('city');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nursing_pharmacy_hospitals');
    }
};
