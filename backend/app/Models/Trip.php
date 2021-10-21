<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Trip extends OneCModel
{
    use HasFactory;

    public static $TYPE_CREATE = 'Заявка на командировку';
    public static $TYPE_EDIT = 'Изменение условий командировки';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'number',
        'date',
        'name',
        'status',
        'condition',
        'type',
        'basis_uuid',
        'basis_update_reason',
        'organization_uuid',
        'employee_uuid',
        'destination_organization',
        'destination_city',
        'errand',
        'date_start',
        'date_end',
        'price_tickets',
        'price_living',
        'per_diem_rate_uuid',
        'smartway_codes_count',
        'is_draft',
        'is_editable',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'basis_uuid',
        'basis_update_reason',
        'organization_uuid',
        'employee_uuid',
        'destination_organization',
        'destination_city',
        'errand',
        'date_start',
        'date_end',
        'price_tickets',
        'price_living',
        'per_diem_rate_uuid',
        'smartway_codes_count',
    ];

    public function tripRoutes()
    {
        return $this->hasMany(TripRoute::class);
    }

    public function tripFiles()
    {
        return $this->hasMany(TripFile::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_uuid');
    }

    public function perDiemRate()
    {
        return $this->belongsTo(PerDiemRate::class);
    }

    public function scopeTypeCreate($query)
    {
        return $query->where('type', self::$TYPE_CREATE);
    }
}
