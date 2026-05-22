<?php

namespace App\Http\Requests\Survivor;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Personal Information
            'full_name' => ['required_if:anonymous,false', 'nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'alternate_phone' => ['nullable', 'string', 'max:20'],
            'gender' => ['nullable', Rule::in(['male', 'female', 'other'])],
            'dob' => ['nullable', 'date', 'before:today'],
            'age_bracket' => ['nullable', Rule::in(['0-16', '17-35', '36-60', '60+'])],

            // PWD (Persons with Disabilities) Information
            'is_pwd' => ['required', 'boolean'],
            'disability_types' => ['required_if:is_pwd,true', 'nullable', 'array'],
            'disability_types.*' => ['string', 'distinct'],
            'pwd_registration_number' => ['required_if:is_pwd,true', 'nullable', 'string', 'max:100'],

            // Identification
            'id_number' => ['nullable', 'string', 'max:50'],
            'id_type' => ['nullable', Rule::in(['national_id', 'passport', 'birth_certificate', 'alien_card', 'other'])],

            // Location Information (using IDs)
            'county_id' => ['nullable', 'integer', 'exists:counties,id'],
            'sub_county_id' => ['nullable', 'integer', 'exists:sub_counties,id'],
            'ward_id' => ['nullable', 'integer', 'exists:wards,id'],
            'village_id' => ['nullable', 'integer', 'exists:villages,id'],

            // Additional Location Details
            'landmark' => ['nullable', 'string', 'max:255'],
            'location_coordinates' => ['nullable', 'array'],
            'location_coordinates.latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'location_coordinates.longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Consent & Privacy
            'anonymous' => ['required', 'boolean'],
            'consent_given' => ['required', 'boolean', 'accepted'],

            // Emergency Contact
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:100'],

            // Metadata
            'metadata' => ['nullable', 'array'],

            // HTTP Method (for form spoofing)
            '_method' => ['nullable', 'string', Rule::in(['POST', 'PUT', 'PATCH', 'DELETE'])],
        ];
    }

    public function messages(): array
    {
        return [
            // Personal Information
            'full_name.required_if' => 'Full name is required when survivor is not anonymous',

            // PWD Information
            'is_pwd.required' => 'Please specify if the survivor has a disability',
            'disability_types.required_if' => 'Please specify the type(s) of disability',
            'disability_types.*.distinct' => 'Disability types must be unique',

            // Identification
            'pwd_registration_number.required_if' => 'PWD registration number is required for persons with disabilities',

            // Location
            'county_id.exists' => 'The selected county is invalid',
            'sub_county_id.exists' => 'The selected sub-county is invalid',
            'ward_id.exists' => 'The selected ward is invalid',
            'village_id.exists' => 'The selected village is invalid',

            // Coordinates
            'location_coordinates.latitude.between' => 'Latitude must be between -90 and 90',
            'location_coordinates.longitude.between' => 'Longitude must be between -180 and 180',

            // Consent
            'consent_given.accepted' => 'Consent must be given to proceed',
            'anonymous.required' => 'Please specify if the survivor wishes to remain anonymous',
        ];
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation(): void
    {
        // Convert string boolean values to actual booleans if needed
        if ($this->has('is_pwd')) {
            $this->merge([
                'is_pwd' => filter_var($this->is_pwd, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('anonymous')) {
            $this->merge([
                'anonymous' => filter_var($this->anonymous, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        if ($this->has('consent_given')) {
            $this->merge([
                'consent_given' => filter_var($this->consent_given, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }
}
