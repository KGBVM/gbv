<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReferralRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'gbv_case_id' => 'required|exists:gbv_cases,id',
            'case_file_id' => 'nullable|exists:case_files,id',
            'to_partner_id' => 'required|exists:partners,id|different:from_partner_id',
            'referral_type' => [
                'required',
                Rule::in([
                    'medical',
                    'legal',
                    'police',
                    'shelter',
                    'counselling',
                    'economic_empowerment',
                    'other'
                ])
            ],
            'reason' => 'required|string|max:1000',
            'services_requested' => 'nullable|array',
            'urgency' => ['required', Rule::in(['routine', 'urgent', 'emergency'])],
        ];
    }

    public function messages()
    {
        return [
            'to_partner_id.different' => 'Cannot refer to the same partner',
            'reason.required' => 'Please provide a reason for the referral',
        ];
    }
}