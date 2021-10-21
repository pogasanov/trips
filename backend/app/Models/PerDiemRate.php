<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class PerDiemRate extends OneCModel
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
        'rate',
        'organization_uuid',
        'default',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['organization',];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
