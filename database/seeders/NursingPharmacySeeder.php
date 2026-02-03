<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NursingPharmacySeeder extends Seeder
{
    public function run()
    {
        // Seed programs
        DB::table('nursing_pharmacy_programs')->insert([
            ['name' => 'B.Sc Nursing', 'duration_years' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pharm D', 'duration_years' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed subjects with unique codes
        DB::table('nursing_pharmacy_subjects')->insert([
            ['name' => 'Anatomy', 'code' => 'NUR-ANAT', 'program_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Physiology', 'code' => 'NUR-PHYS', 'program_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pharmaceutical Chemistry', 'code' => 'PHA-CHEM', 'program_id' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Seed a curriculum example
        DB::table('nursing_pharmacy_curricula')->insert([
            [
                'program_id' => 1,
                'subject_id' => 1,
                'academic_year' => 1,
                'sequence' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
