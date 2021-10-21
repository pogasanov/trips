<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Advance extends OneCModel
{
    use HasFactory;

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
        'total_price',
        'is_draft',
        'is_editable',

        'basis_uuid',
        'organization_uuid',
        'employee_uuid',
        'purpose_uuid',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'basis_uuid',
        'organization_uuid',
        'employee_uuid',
        'purpose_uuid',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_uuid');
    }

    public function purpose()
    {
        return $this->belongsTo(Expenditure::class, 'purpose_uuid');
    }

    public function advanceItems()
    {
        return $this->hasMany(AdvanceItem::class);
    }

    public function advanceFiles()
    {
        return $this->hasMany(AdvanceFile::class);
    }
}
