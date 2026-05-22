<?php
// app/Models/AudioTranscription.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AudioTranscription extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'gbv_case_id',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'duration_seconds',
        'transcription_text',
        'status',
        'language',
        'confidence_score',
        'metadata',
        'notes',
        'uploaded_by',
        'processed_by',
        'processed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
        'duration_seconds' => 'integer',
        'confidence_score' => 'float',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
