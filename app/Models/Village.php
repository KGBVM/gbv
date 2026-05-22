<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    use HasFactory;

    protected $fillable = [
        'county_id',
        'sub_county_id',
        'ward_id',
        'code',
        'name'
    ];

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
}