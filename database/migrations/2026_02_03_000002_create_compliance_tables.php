<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('compliance_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_type'); // inc_audit, pci_audit, university_compliance, inspection
            $table->unsignedBigInteger('program_id')->nullable();
            $table->unsignedTinyInteger('semester')->nullable();
            $table->json('data');
            $table->date('report_date');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('compliance_audits', function (Blueprint $table) {
            $table->id();
            $table->string('audit_type'); // clinical_hours, faculty_matrix, lab_infra, etc.
            $table->date('audit_date');
            $table->unsignedBigInteger('auditor_id')->nullable();
            $table->string('compliance_status');
            $table->float('compliance_score')->nullable();
            $table->string('audit_status')->default('open'); // open, closed, escalated
            $table->json('findings')->nullable();
            $table->json('actions')->nullable();
            $table->timestamps();
        });

        Schema::create('compliance_matrices', function (Blueprint $table) {
            $table->id();
            $table->string('matrix_type'); // faculty, student, infra, etc.
            $table->json('matrix_data');
            $table->date('effective_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_matrices');
        Schema::dropIfExists('compliance_audits');
        Schema::dropIfExists('compliance_reports');
    }
};
