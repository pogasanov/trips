<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdvanceFile extends OneCModel
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
        'advance_uuid',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['advance_uuid'];

    public function advance()
    {
        return $this->belongsTo(Advance::class);
    }
}
