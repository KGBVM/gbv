<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;

class UploadAudioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('gbvCase'));
    }

    public function rules(): array
    {
        return [
            'audio' => ['required', 'file', 'mimes:mp3,wav,m4a,ogg', 'max:10240'], // 10MB max
        ];
    }

    public function messages(): array
    {
        return [
            'audio.required' => 'Please select an audio file.',
            'audio.mimes' => 'Audio file must be of type: mp3, wav, m4a, ogg.',
            'audio.max' => 'Audio file size must not exceed 10MB.',
        ];
    }
}