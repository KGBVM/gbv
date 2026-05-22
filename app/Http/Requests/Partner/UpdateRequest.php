<?php

namespace App\Http\Requests\Partner;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
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
        $partnerId = $this->route('partner');

        return [
            // Organization Information
            'organization_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('partners', 'organization_name')->ignore($partnerId)
            ],
            'organization_type_id' => 'sometimes|required|exists:organization_types,id',
            'registration_number' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('partners', 'registration_number')->ignore($partnerId)
            ],
            'year_established' => 'nullable|integer|min:1800|max:' . date('Y'),

            // Contact Information
            'contact_person' => 'sometimes|required|string|max:255',
            'contact_person_title_id' => 'nullable|exists:titles,id',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('partners', 'email')->ignore($partnerId)
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('partners', 'phone')->ignore($partnerId)
            ],
            'alternate_phone' => 'nullable|string|max:20|different:phone',

            // Address Information
            'address' => 'sometimes|required|string|max:500',
            'city' => 'nullable|string|max:100',
            'county_id' => 'sometimes|required|exists:counties,id',
            'sub_county_id' => 'nullable|exists:sub_counties,id',
            'ward_id' => 'nullable|exists:wards,id',
            'village_id' => 'nullable|exists:villages,id',
            'postal_code' => 'nullable|string|max:20',

            // Status and Verification
            'status' => 'nullable|string|in:' . implode(',', array_keys(\App\Models\Partner::getStatuses())),
            'verified_at' => 'nullable|date',

            // Additional Information
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:5000',
            'services_offered' => 'nullable|array',
            'services_offered.*' => 'string|max:255',
            'service_area_id' => 'nullable|exists:service_areas,id',

            // Terms Agreement (cannot update terms acceptance directly)
            'terms_accepted' => 'prohibited',
            'data_sharing_consent' => 'sometimes|boolean',
            'terms_accepted_at' => 'prohibited',

            // Metadata
            'metadata' => 'nullable|array',
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
            'email.required' => 'Email address is required.',
            'email.unique' => 'This email is already registered.',
            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number is already registered.',
            'status.in' => 'Invalid status value.',
            'terms_accepted.prohibited' => 'Terms acceptance cannot be updated directly.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];

        // Trim string fields if present
        if ($this->has('organization_name')) {
            $data['organization_name'] = trim($this->organization_name);
        }
        if ($this->has('contact_person')) {
            $data['contact_person'] = trim($this->contact_person);
        }
        if ($this->has('email')) {
            $data['email'] = strtolower(trim($this->email));
        }
        if ($this->has('phone')) {
            $data['phone'] = preg_replace('/[^0-9+]/', '', $this->phone);
        }

        if (!empty($data)) {
            $this->merge($data);
        }
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
            'email' => 'email address',
            'phone' => 'phone number',
            'alternate_phone' => 'alternate phone number',
            'county_id' => 'county',
            'sub_county_id' => 'sub-county',
            'ward_id' => 'ward',
            'village_id' => 'village',
            'service_area_id' => 'service area',
        ];
    }
}
