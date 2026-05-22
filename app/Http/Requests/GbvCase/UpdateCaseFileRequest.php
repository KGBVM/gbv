<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaseFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:draft,submitted,archived',
        ];
    }
}