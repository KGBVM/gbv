<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'created_by',
        'content',
        'type',
        'is_private',
        'is_important',
        'attachments',
        'metadata',
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'is_important' => 'boolean',
        'attachments' => 'array',
        'metadata' => 'array',
    ];

    public function case()
    {
        return $this->belongsTo(GbvCase::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
