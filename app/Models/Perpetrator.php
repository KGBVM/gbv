<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Perpetrator extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'created_by',
        'name',
        'name_known',
        'gender',
        'age_range',
        'relationship',
        'relationship_to_survivor',
        'relationship_details',
        'physical_description',
        'identifying_features',
        'is_repeat_offender',
        'previous_incidents_count',
        'additional_info',
    ];

    protected $casts = [
        'name_known' => 'boolean',
        'is_repeat_offender' => 'boolean',
        'physical_description' => 'array',
        'identifying_features' => 'array',
    ];

    public function case()
    {
        return $this->belongsTo(GbvCase::class);
    }
}
