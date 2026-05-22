<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Referral extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'referral_number',
        'gbv_case_id',
        'case_file_id',
        'from_partner_id',
        'to_partner_id',
        'referral_type',
        'reason',
        'services_requested',
        'status',
        'accepted_at',
        'completed_at',
        'feedback',
        'urgency',
        'created_by',
    ];

    protected $casts = [
        'services_requested' => 'array',
        'accepted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function case()
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function gbvCase()
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function file()
    {
        return $this->belongsTo(CaseFile::class, 'case_file_id');
    }

    public function fromPartner()
    {
        return $this->belongsTo(Partner::class, 'from_partner_id');
    }

    public function toPartner()
    {
        return $this->belongsTo(Partner::class, 'to_partner_id');
    }
}
