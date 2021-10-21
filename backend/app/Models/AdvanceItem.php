<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdvanceItem extends OneCModel
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'advance_uuid',
        'line_num',
        'incoming_doc_type',
        'incoming_doc_number',
        'incoming_doc_date',
        'invoice_number',
        'invoice_date',
        'partner_uuid',
        'content',
        'quantity',
        'price',
        'total',
        'vat_rate',
        'vat_total',
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'advance_uuid',
    ];

    public function advance()
    {
        return $this->belongsTo(Advance::class);
    }
}
