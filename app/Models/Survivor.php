<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Survivor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id',

        'unique_code',
        'full_name',
        'phone',
        'alternate_phone',
        'gender',

        'dob',
        'age',
        'age_bracket',

        'is_pwd',
        'pwd_type',
        'pwd_registration_number',

        'id_number',
        'id_type',

        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',

        'landmark',
        'location_coordinates',

        'anonymous',
        'consent_given',
        'consent_given_at',
        'consent_details',

        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',

        'metadata',
        'created_by',
    ];

    protected $casts = [
        'dob' => 'date',
        'consent_given_at' => 'datetime',

        'anonymous' => 'boolean',
        'consent_given' => 'boolean',
        'is_pwd' => 'boolean',

        'location_coordinates' => 'array',
        'consent_details' => 'array',
        'metadata' => 'array',
    ];

    public function cases()
    {
        return $this->hasMany(GbvCase::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function county()
    {
        return $this->belongsTo(County::class);
    }

    public function subCounty()
    {
        return $this->belongsTo(SubCounty::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function village()
    {
        return $this->belongsTo(Village::class);
    }
}
