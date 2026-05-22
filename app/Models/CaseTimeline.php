<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseTimeline extends Model
{
    protected $fillable = [
        'gbv_case_id',
        'created_by',
        'type',
        'title',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function case()
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
