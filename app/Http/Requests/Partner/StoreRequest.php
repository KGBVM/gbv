<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Adjust based on your authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'organization_name' => 'required|string|max:255',
            'organization_type_id' => 'required|exists:organization_types,id',
            'registration_number' => 'nullable|string|max:100',
            'year_established' => 'nullable|integer|min:1800|max:' . date('Y'),
            'contact_person' => 'required|string|max:255',
            'contact_person_title_id' => 'nullable|exists:titles,id',
            'email' => 'required|email|max:255|unique:partners,email',
            'phone' => 'required|string|max:20|unique:partners,phone',
            'alternate_phone' => 'nullable|string|max:20|different:phone',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'county_id' => 'nullable|exists:counties,id',
            'postal_code' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string|min:8',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:5000',
            'service_area_id' => 'nullable|exists:service_areas,id',
            'terms_accepted' => 'required|boolean|accepted',
            'data_sharing_consent' => 'required|boolean|accepted',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_name.required' => 'Organization name is required.',
            'organization_name.unique' => 'An organization with this name already exists.',
            'organization_type_id.required' => 'Organization type is required.',
            'organization_type_id.exists' => 'Selected organization type is invalid.',
            'contact_person.required' => 'Contact person name is required.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email is already registered.',
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'terms_accepted.accepted' => 'You must accept the terms and conditions.',
            'data_sharing_consent.accepted' => 'You must consent to data sharing.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [
            'organization_name' => $this->organization_name ? trim($this->organization_name) : null,
            'contact_person' => $this->contact_person ? trim($this->contact_person) : null,
            'email' => $this->email ? strtolower(trim($this->email)) : null,
            'phone' => $this->phone ? $this->formatPhoneNumber($this->phone) : null,
            'alternate_phone' => $this->alternate_phone ? $this->formatPhoneNumber($this->alternate_phone) : null,
        ];

        // Only add fields that exist in the request
        if ($this->has('terms_accepted')) {
            $data['terms_accepted'] = filter_var($this->terms_accepted, FILTER_VALIDATE_BOOLEAN);
        }

        if ($this->has('data_sharing_consent')) {
            $data['data_sharing_consent'] = filter_var($this->data_sharing_consent, FILTER_VALIDATE_BOOLEAN);
        }

        $this->merge($data);
    }

    /**
     * Format phone number (Kenyan format)
     */
    protected function formatPhoneNumber($phone): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Check if it's a Kenyan number
        if (strlen($phone) === 9 && substr($phone, 0, 1) !== '0') {
            $phone = '0' . $phone;
        }

        if (strlen($phone) === 10 && substr($phone, 0, 1) === '0') {
            return $phone;
        }

        if (strlen($phone) === 12 && substr($phone, 0, 3) === '254') {
            return '0' . substr($phone, 3);
        }

        // Return as is if doesn't match Kenyan format
        return $phone;
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'organization_name' => 'organization name',
            'organization_type_id' => 'organization type',
            'registration_number' => 'registration number',
            'year_established' => 'year established',
            'contact_person' => 'contact person',
            'contact_person_title_id' => 'contact person title',
            'email' => 'email address',
            'phone' => 'phone number',
            'alternate_phone' => 'alternate phone number',
            'address' => 'address',
            'city' => 'city',
            'county_id' => 'county',
            'postal_code' => 'postal code',
            'password' => 'password',
            'website' => 'website',
            'description' => 'description',
            'service_area_id' => 'service area',
            'terms_accepted' => 'terms acceptance',
            'data_sharing_consent' => 'data sharing consent',
        ];
    }

    /**
     * Handle after validation hook for additional checks
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Add custom validation for phone number format
            if ($this->phone && !preg_match('/^0[17]\d{8}$/', $this->phone)) {
                $validator->errors()->add('phone', 'Please provide a valid Kenyan phone number (e.g., 0712345678)');
            }
        });
    }
}
