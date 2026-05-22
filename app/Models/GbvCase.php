<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GbvCase extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id',
        'survivor_id',
        'county_id',
        'sub_county_id',
        'ward_id',
        'village_id',
        'primary_officer_id',
        'created_by',
        'concluded_by',
        'case_number',
        'incident_number',
        'incident_type',
        'incident_type_other',
        'incident_date',
        'incident_time',
        'incident_location',
        'description',
        'reported_to_police',
        'police_station',
        'ob_number',
        'medical_attention',
        'health_facility',
        'status',
        'priority',
        'conclusion_type',
        'conclusion_notes',
        'concluded_at',
        'is_sensitive',
        'confidentiality_level',
        'consent_obtained',
        'consent_details',
        'metadata',
    ];

    protected $casts = [
        'incident_date' => 'date',
        'concluded_at' => 'datetime',
        'metadata' => 'array',
        'reported_to_police' => 'boolean',
        'medical_attention' => 'boolean',
        'is_sensitive' => 'boolean',
        'consent_obtained' => 'boolean',
    ];

    /* ===================== Relationships ===================== */

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function survivor()
    {
        return $this->belongsTo(Survivor::class);
    }

    public function files()
    {
        return $this->hasMany(CaseFile::class);
    }

    public function caseFiles()
    {
        return $this->hasMany(CaseFile::class);
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class);
    }

    public function perpetrators()
    {
        return $this->hasMany(Perpetrator::class);
    }

    public function notes()
    {
        return $this->hasMany(CaseNote::class);
    }

    public function timelines()
    {
        return $this->hasMany(CaseTimeline::class);
    }

    /**
     * Primary officer
     */
    public function primaryOfficer()
    {
        return $this->belongsTo(User::class, 'primary_officer_id');
    }

    /**
     * Concluded by
     */
    public function concludedBy()
    {
        return $this->belongsTo(User::class, 'concluded_by');
    }

    public function referral()
    {
        return $this->belongsTo(Referral::class);
    }

    /**
     * creator
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
