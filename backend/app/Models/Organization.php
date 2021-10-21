<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Organization extends OneCModel
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
    protected $hidden = ['partners', 'expenditures'];

    public function partners()
    {
        return $this->belongsToMany(Partner::class);
    }

    public function expenditures()
    {
        return $this->belongsToMany(Expenditure::class);
    }

    public function per_diem_rates()
    {
        return $this->hasMany(PerDiemRate::class);
    }
}
