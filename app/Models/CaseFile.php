<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CaseFile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'gbv_case_id',
        'partner_id',
        'created_by',
        'reviewed_by',
        'parent_file_id',
        'file_number',
        'file_type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'encryption_key',
        'status',
        'submitted_at',
        'reviewed_at',
        'review_notes',
        'audio_transcription',
        'transcription_metadata',
        'version',
        'shared_with',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'transcription_metadata' => 'array',
        'shared_with' => 'array',
    ];

    public function case()
    {
        return $this->belongsTo(GbvCase::class, 'gbv_case_id');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_file_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_file_id');
    }
}
