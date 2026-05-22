<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_name' => $this->organization_name,
            'organization_type' => $this->organization_type,
            'organization_type_label' => $this->getTypeLabel(),
            'registration_number' => $this->registration_number,
            'year_established' => $this->year_established,
            'contact_person' => $this->contact_person,
            'email' => $this->email,
            'phone' => $this->phone,
            'alternate_phone' => $this->alternate_phone,
            'address' => $this->address,
            'city' => $this->city,
            'county' => $this->county,
            'postal_code' => $this->postal_code,
            'website' => $this->website,
            'description' => $this->description,
            'services_offered' => $this->services_offered,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'admin_user' => $this->whenLoaded('adminUser', function () {
                return [
                    'id' => $this->adminUser->id,
                    'name' => $this->adminUser->name,
                    'email' => $this->adminUser->email,
                    'role' => $this->adminUser->role,
                ];
            }),
        ];
    }

    /**
     * Get organization type label.
     */
    protected function getTypeLabel(): string
    {
        return match ($this->organization_type) {
            'hospital' => 'Hospital/Health Facility',
            'police' => 'Police Station/Law Enforcement',
            'ngo' => 'Non-Governmental Organization',
            'cbo' => 'Community Based Organization',
            'fbo' => 'Faith Based Organization',
            'shelter' => 'Shelter/Safe House',
            'legal' => 'Legal Aid/Justice Center',
            'education' => 'Educational Institution',
            'government' => 'Government Agency',
            'international' => 'International Organization',
            'private' => 'Private Sector',
            'other' => 'Other',
            default => ucfirst($this->organization_type),
        };
    }

    /**
     * Get status label.
     */
    protected function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Approval',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'suspended' => 'Suspended',
            default => ucfirst($this->status),
        };
    }
}