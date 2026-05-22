<?php

namespace App\Enums;

enum CaseStatus: string
{
    case REPORTED = 'reported';
    case UNDER_INVESTIGATION = 'under_investigation';
    case MEDICAL_ATTENTION = 'medical_attention';
    case LEGAL_PROCEEDINGS = 'legal_proceedings';
    case COUNSELLING = 'counselling';
    case SHELTER_PROVIDED = 'shelter_provided';
    case CONCLUDED = 'concluded';
    case CLOSED = 'closed';
    case REOPENED = 'reopened';

    public function label(): string
    {
        return match ($this) {
            self::REPORTED => 'Reported',
            self::UNDER_INVESTIGATION => 'Under Investigation',
            self::MEDICAL_ATTENTION => 'Medical Attention',
            self::LEGAL_PROCEEDINGS => 'Legal Proceedings',
            self::COUNSELLING => 'Counselling',
            self::SHELTER_PROVIDED => 'Shelter Provided',
            self::CONCLUDED => 'Concluded',
            self::CLOSED => 'Closed',
            self::REOPENED => 'Reopened',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::REPORTED => 'warning',
            self::UNDER_INVESTIGATION => 'info',
            self::MEDICAL_ATTENTION => 'primary',
            self::LEGAL_PROCEEDINGS => 'secondary',
            self::COUNSELLING => 'info',
            self::SHELTER_PROVIDED => 'success',
            self::CONCLUDED => 'success',
            self::CLOSED => 'secondary',
            self::REOPENED => 'danger',
        };
    }

    public function isActive(): bool
    {
        return !in_array($this, [self::CONCLUDED, self::CLOSED]);
    }
}