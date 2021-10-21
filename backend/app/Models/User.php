<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends OneCModel
{
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'name',
        'organization_uuid',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'pin', 'api_token',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class, 'employee_uuid');
    }

    public function advances()
    {
        return $this->hasMany(Advance::class, 'employee_uuid');
    }
}
