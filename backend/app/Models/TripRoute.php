<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class TripRoute extends OneCModel
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'trip_uuid',
        'line_num',
        'date',
        'type',
        'from',
        'to',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'trip_uuid',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
