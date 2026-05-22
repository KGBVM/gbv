<?php

namespace App\Http\Requests\GbvCase;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
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
            // Survivor Information
            'survivor_id' => 'required|exists:survivors,id',
            'incident_number' => 'required|string|max:50|unique:gbv_cases,incident_number',

            // Incident Details
            'incident_type' => [
                'required',
                Rule::in([
                    'rape',
                    'defilement',
                    'physical_assault',
                    'emotional_abuse',
                    'economic_abuse',
                    'child_marriage',
                    'fgm',
                    'cyberbullying',
                    'stalking',
                    'sexual_harassment',
                    'other'
                ])
            ],
            'incident_type_other' => 'required_if:incident_type,other|nullable|string|max:255',
            'incident_date' => 'required|date|before_or_equal:today',
            'incident_time' => 'nullable|date_format:H:i',
            'description' => 'required|string|min:10|max:5000',

            // Location Information
            'county_id' => 'nullable|exists:counties,id',
            'sub_county_id' => 'nullable|exists:sub_counties,id',
            'ward_id' => 'nullable|exists:wards,id',
            'village_id' => 'nullable|exists:villages,id',
            'incident_location' => 'nullable|string|max:500',

            // Police Reporting
            'reported_to_police' => 'boolean',
            'police_station' => 'required_if:reported_to_police,true|nullable|string|max:255',
            'ob_number' => 'nullable|string|max:100',

            // Medical Attention
            'medical_attention' => 'boolean',
            'health_facility' => 'required_if:medical_attention,true|nullable|string|max:255',

            // Perpetrators
            'perpetrators' => 'nullable|array|min:1',
            'perpetrators.*.age_range' => 'nullable|string|max:50',
            'perpetrators.*.gender' => 'nullable|string|in:male,female,other,unknown',
            'perpetrators.*.relationship' => 'nullable|string|max:100',
            'perpetrators.*.name_known' => 'boolean',
            'perpetrators.*.name' => 'required_if:perpetrators.*.name_known,true|nullable|string|max:255',
            'perpetrators.*.relationship_details' => 'nullable|string|max:255',

            // Case Management
            'priority' => ['required', Rule::in(['low', 'normal', 'high', 'critical'])],
            'is_sensitive' => 'boolean',
            'primary_officer_id' => 'nullable|exists:users,id',
            'confidentiality_level' => ['required', Rule::in(['standard', 'confidential', 'restricted'])],
            'consent_obtained' => 'boolean',
            'consent_details' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Survivor messages
            'survivor_id.required' => 'Please select a survivor',
            'survivor_id.exists' => 'The selected survivor does not exist',
            'incident_number.required' => 'Case number is required',
            'incident_number.unique' => 'This case number already exists',

            // Incident messages
            'incident_type.required' => 'Please select an incident type',
            'incident_type.in' => 'Please select a valid incident type',
            'incident_type_other.required_if' => 'Please specify the incident type',
            'incident_date.required' => 'Please provide the incident date',
            'incident_date.before_or_equal' => 'Incident date cannot be in the future',
            'description.required' => 'Please provide a description of the incident',
            'description.min' => 'Please provide at least 10 characters for the description',

            // Police messages
            'police_station.required_if' => 'Please provide the police station name',

            // Medical messages
            'health_facility.required_if' => 'Please provide the health facility name',

            // Perpetrator messages
            'perpetrators.min' => 'Please provide information for at least one perpetrator',
            'perpetrators.*.name.required_if' => 'Perpetrator name is required when name is known',

            // Consent messages
            'consent_obtained.required' => 'Please confirm consent for this case',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string booleans to actual booleans
        $this->merge([
            'reported_to_police' => filter_var($this->reported_to_police, FILTER_VALIDATE_BOOLEAN),
            'medical_attention' => filter_var($this->medical_attention, FILTER_VALIDATE_BOOLEAN),
            'is_sensitive' => filter_var($this->is_sensitive, FILTER_VALIDATE_BOOLEAN),
            'consent_obtained' => filter_var($this->consent_obtained, FILTER_VALIDATE_BOOLEAN),
        ]);

        // Handle perpetrators name_known boolean conversion
        if ($this->has('perpetrators') && is_array($this->perpetrators)) {
            $perpetrators = $this->perpetrators;
            foreach ($perpetrators as $key => $perpetrator) {
                if (isset($perpetrator['name_known'])) {
                    $perpetrators[$key]['name_known'] = filter_var($perpetrator['name_known'], FILTER_VALIDATE_BOOLEAN);
                }
            }
            $this->merge(['perpetrators' => $perpetrators]);
        }

        // Set default confidentiality level if not provided
        if (!$this->has('confidentiality_level')) {
            $this->merge(['confidentiality_level' => 'standard']);
        }

        // Set default priority if not provided
        if (!$this->has('priority')) {
            $this->merge(['priority' => 'normal']);
        }
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'survivor_id' => 'survivor',
            'incident_number' => 'case number',
            'incident_type' => 'incident type',
            'incident_date' => 'incident date',
            'description' => 'incident description',
            'police_station' => 'police station',
            'health_facility' => 'health facility',
            'primary_officer_id' => 'primary officer',
        ];
    }
}