<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('company_id');
            $table->string('supervisor_name')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('duration_days')->nullable();
            $table->string('status')->default('ongoing'); // ongoing, completed, certified
            $table->text('supervisor_feedback')->nullable();
            $table->text('industry_feedback')->nullable();
            $table->string('certificate_path')->nullable();
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->nullable(); // hospital, pharma, etc.
            $table->string('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
        Schema::dropIfExists('companies');
    }
};
