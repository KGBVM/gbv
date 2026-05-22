<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'organization_name',
        'organization_type_id',
        'registration_number',
        'year_established',
        'contact_person',
        'email',
        'phone',
        'alternate_phone',
        'address',
        'city',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'postal_code',
        'api_key',
        'api_secret',
        'api_settings',
        'website',
        'description',
        'services_offered',
        'status',
        'verified_at',
        'verification_token',
        'terms_accepted',
        'data_sharing_consent',
        'terms_accepted_at',
        'metadata',
    ];

    protected $casts = [
        'api_settings' => 'array',
        'services_offered' => 'array',
        'metadata' => 'array',

        'terms_accepted' => 'boolean',
        'data_sharing_consent' => 'boolean',

        'verified_at' => 'datetime',
        'terms_accepted_at' => 'datetime',
    ];

    public function type()
    {
        return $this->belongsTo(OrganizationType::class, 'organization_type_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function cases()
    {
        return $this->hasMany(GbvCase::class);
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
