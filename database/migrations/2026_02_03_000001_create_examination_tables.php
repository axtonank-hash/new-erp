<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id('exam_id');
            $table->unsignedBigInteger('program_id');
            $table->unsignedTinyInteger('semester');
            $table->string('exam_type'); // internal, practical, university, viva, sessional, etc.
            $table->date('exam_date');
            $table->integer('max_marks');
            $table->integer('passing_marks');
            $table->float('internal_weight')->nullable();
            $table->float('external_weight')->nullable();
            $table->timestamps();
        });

        Schema::create('results', function (Blueprint $table) {
            $table->id('result_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('exam_id');
            $table->unsignedBigInteger('subject_id');
            $table->integer('internal_marks')->nullable();
            $table->integer('practical_marks')->nullable();
            $table->integer('external_marks')->nullable();
            $table->integer('total_marks');
            $table->string('grade');
            $table->enum('status', ['pass', 'fail', 'backlog']);
            $table->boolean('is_supplementary')->default(false);
            $table->date('supplementary_date')->nullable();
            $table->timestamps();
        });

        Schema::create('result_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('program_id');
            $table->unsignedTinyInteger('semester');
            $table->float('pass_percentage');
            $table->json('subject_wise_performance')->nullable();
            $table->json('faculty_impact')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_analytics');
        Schema::dropIfExists('results');
        Schema::dropIfExists('exams');
    }
};
