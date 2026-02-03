<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'type',
        'address',
        'contact_person',
        'contact_email',
        'contact_phone',
    ];

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }
}
