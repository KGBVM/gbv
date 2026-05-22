<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CaseFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $maxSize = config('gbv.max_file_size', 10240) * 1024; // Convert MB to KB

        return [
            'file' => [
                'required',
                'file',
                'max:' . $maxSize,
                'mimes:' . implode(',', $this->getAllowedExtensions()),
            ],
            'file_type' => [
                'required',
                'string',
                Rule::in(array_keys(config('gbv.file_types', []))),
            ],
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:draft,submitted',
            'encrypt' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.max' => 'The file size must not exceed ' . (config('gbv.max_file_size', 10)) . 'MB.',
            'file.mimes' => 'The file type is not allowed. Please check the allowed file types.',
            'title.required' => 'Please provide a title for this file.',
        ];
    }

    /**
     * Get allowed file extensions based on configuration.
     */
    private function getAllowedExtensions(): array
    {
        $mimeToExt = [
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'video/mp4' => 'mp4',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        ];

        $allowedMimes = config('gbv.allowed_mime_types', []);
        $extensions = [];

        foreach ($allowedMimes as $mime) {
            if (isset($mimeToExt[$mime])) {
                $extensions[] = $mimeToExt[$mime];
            }
        }

        return array_unique($extensions);
    }
}