<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $table = 'exams';
    protected $primaryKey = 'exam_id';
    protected $fillable = [
        'program_id',
        'semester',
        'exam_type',
        'exam_date',
        'max_marks',
        'passing_marks',
        'internal_weight',
        'external_weight',
    ];

    public function results()
    {
        return $this->hasMany(Result::class, 'exam_id', 'exam_id');
    }
}
