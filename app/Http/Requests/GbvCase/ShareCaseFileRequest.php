<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;

class ShareCaseFileRequest extends FormRequest
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
            'partner_ids' => 'required|array',
            'partner_ids.*' => 'exists:partners,id',
            'permissions' => 'sometimes|string|in:view,download,all',
            'expires_at' => 'nullable|date|after:now',
        ];
    }
}