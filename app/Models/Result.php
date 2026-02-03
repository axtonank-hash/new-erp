<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $table = 'results';
    protected $primaryKey = 'result_id';
    protected $fillable = [
        'student_id',
        'exam_id',
        'subject_id',
        'internal_marks',
        'practical_marks',
        'external_marks',
        'total_marks',
        'grade',
        'status',
        'is_supplementary',
        'supplementary_date',
    ];

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id', 'exam_id');
    }
}
