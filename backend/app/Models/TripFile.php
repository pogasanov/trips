<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class TripFile extends OneCModel
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
        'trip_uuid',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['trip_uuid'];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
