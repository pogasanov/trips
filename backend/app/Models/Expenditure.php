<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expenditure extends OneCModel
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'require_basis',
    ];

    protected $hidden = ['organizations',];

    public function organizations()
    {
        return $this->belongsToMany(Organization::class);
    }
}
