<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Partner extends OneCModel
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'name',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['organizations',];

    public function organizations()
    {
        return $this->belongsToMany(Organization::class);
    }
}
