<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;

class ConcludeCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'conclusion_type' => ['required', 'string', 'in:successful_prosecution,out_of_court_settlement,referred_to_other_agency,survivor_declined_further_action,insufficient_evidence,survivor_relocated,other'],
            'conclusion_notes' => ['required', 'string', 'min:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'conclusion_notes.required' => 'Please provide conclusion notes.',
            'conclusion_notes.min' => 'Conclusion notes must be at least 10 characters.',
        ];
    }
}