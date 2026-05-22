<?php

use App\Models\GbvCase;
use App\Models\Survivor;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Generate Partner Verification Token
|--------------------------------------------------------------------------
*/

if (!function_exists('generatePartnerVerificationToken')) {
    function generatePartnerVerificationToken(): string
    {
        return bin2hex(random_bytes(32));
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Get Timeline Icon
|--------------------------------------------------------------------------
*/

if (!function_exists('getTimelineIcon')) {
    function getTimelineIcon(string $type): string
    {
        return match ($type) {
            'created' => 'PlusCircle',
            'status_change' => 'RefreshCw',
            'concluded' => 'CheckCircle',
            'note' => 'MessageSquare',
            'referral' => 'Share2',
            'file_upload' => 'FileText',
            default => 'Clock',
        };
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Generate Case Number
|--------------------------------------------------------------------------
*/

if (!function_exists('generateCaseNumber')) {
    function generateCaseNumber(): string
    {
        $prefix = 'GBV';
        $year = date('Y');
        $month = date('m');

        $lastCase = GbvCase::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastCase) {
            $lastNumber = intval(substr($lastCase->case_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$year}{$month}-{$newNumber}";
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Generate survivor Code
|--------------------------------------------------------------------------
*/
if (!function_exists('generateSurvivorCode')) {
    function generateSurvivorCode(): string
    {
        $prefix = 'SV';
        $year = date('y');
        $month = date('m');

        $lastSurvivor = Survivor::whereYear('created_at', date('Y'))
            ->orderBy('id', 'desc')
            ->first();

        if ($lastSurvivor) {
            $lastCode = $lastSurvivor->unique_code;
            $lastNumber = intval(substr($lastCode, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}{$year}{$month}{$newNumber}";
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Incident Types Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getIncidentTypes')) {
    function getIncidentTypes(): array
    {
        return [
            ['value' => 'rape', 'label' => 'Rape', 'icon' => '⚠️', 'category' => 'sexual'],
            ['value' => 'defilement', 'label' => 'Defilement', 'icon' => '⚠️', 'category' => 'sexual'],
            ['value' => 'physical_assault', 'label' => 'Physical Assault', 'icon' => '👊', 'category' => 'physical'],
            ['value' => 'emotional_abuse', 'label' => 'Emotional Abuse', 'icon' => '😔', 'category' => 'emotional'],
            ['value' => 'economic_abuse', 'label' => 'Economic Abuse', 'icon' => '💰', 'category' => 'economic'],
            ['value' => 'child_marriage', 'label' => 'Child Marriage', 'icon' => '👰', 'category' => 'social'],
            ['value' => 'fgm', 'label' => 'FGM', 'icon' => '⚕️', 'category' => 'social'],
            ['value' => 'cyberbullying', 'label' => 'Cyberbullying', 'icon' => '💻', 'category' => 'digital'],
            ['value' => 'stalking', 'label' => 'Stalking', 'icon' => '👁️', 'category' => 'other'],
            ['value' => 'sexual_harassment', 'label' => 'Sexual Harassment', 'icon' => '🛑', 'category' => 'sexual'],
            ['value' => 'other', 'label' => 'Other', 'icon' => '📌', 'category' => 'other'],
        ];
    }
}

if (!function_exists('getIncidentTypeByValue')) {
    function getIncidentTypeByValue(string $value): ?array
    {
        $types = getIncidentTypes();

        foreach ($types as $type) {
            if ($type['value'] === $value) {
                return $type;
            }
        }

        return null;
    }
}

if (!function_exists('getIncidentTypesByCategory')) {
    function getIncidentTypesByCategory(string $category): array
    {
        return array_filter(getIncidentTypes(), function ($type) use ($category) {
            return $type['category'] === $category;
        });
    }
}

if (!function_exists('getIncidentCategories')) {
    function getIncidentCategories(): array
    {
        $categories = [];

        foreach (getIncidentTypes() as $type) {
            $categories[] = $type['category'];
        }

        return array_unique($categories);
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Priority Levels Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getPriorityLevels')) {
    function getPriorityLevels(): array
    {
        return [
            [
                'value' => 'low',
                'label' => 'Low',
                'color' => 'success',
                'description' => 'Non-urgent, routine follow-up'
            ],
            [
                'value' => 'normal',
                'label' => 'Normal',
                'color' => 'primary',
                'description' => 'Standard handling time'
            ],
            [
                'value' => 'high',
                'label' => 'High',
                'color' => 'warning',
                'description' => 'Requires prompt attention'
            ],
            [
                'value' => 'critical',
                'label' => 'Critical',
                'color' => 'danger',
                'description' => 'Immediate intervention needed'
            ],
        ];
    }
}

if (!function_exists('getPriorityLevelByValue')) {
    function getPriorityLevelByValue(string $value): ?array
    {
        $levels = getPriorityLevels();

        foreach ($levels as $level) {
            if ($level['value'] === $value) {
                return $level;
            }
        }

        return null;
    }
}

if (!function_exists('getPriorityColor')) {
    function getPriorityColor(string $value): string
    {
        $level = getPriorityLevelByValue($value);
        return $level ? $level['color'] : 'secondary';
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Confidentiality Levels Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getConfidentialityLevels')) {
    function getConfidentialityLevels(): array
    {
        return [
            [
                'value' => 'standard',
                'label' => 'Standard',
                'description' => 'Accessible to all authorized case workers'
            ],
            [
                'value' => 'restricted',
                'label' => 'Restricted',
                'description' => 'Limited access to senior staff only'
            ],
            [
                'value' => 'anonymous',
                'label' => 'Anonymous',
                'description' => 'Survivor identity anonymized'
            ],
        ];
    }
}

if (!function_exists('getConfidentialityLevelByValue')) {
    function getConfidentialityLevelByValue(string $value): ?array
    {
        $levels = getConfidentialityLevels();

        foreach ($levels as $level) {
            if ($level['value'] === $value) {
                return $level;
            }
        }

        return null;
    }
}

if (!function_exists('getIdTypes')) {
    function getIdTypes(): array
    {
        return [
            ['value' => 'national_id', 'label' => 'National ID'],
            ['value' => 'passport', 'label' => 'Passport'],
            ['value' => 'birth_certificate', 'label' => 'Birth Certificate'],
            ['value' => 'alien_card', 'label' => 'Alien Card'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Disability Types Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getDisabilityTypes')) {
    function getDisabilityTypes(): array
    {
        return [
            ['value' => 'physical', 'label' => 'Physical Disability', 'icon' => '🦽', 'category' => 'mobility'],
            ['value' => 'visual', 'label' => 'Visual Impairment', 'icon' => '👁️', 'category' => 'sensory'],
            ['value' => 'hearing', 'label' => 'Hearing Impairment', 'icon' => '👂', 'category' => 'sensory'],
            ['value' => 'speech', 'label' => 'Speech Impairment', 'icon' => '🗣️', 'category' => 'communication'],
            ['value' => 'intellectual', 'label' => 'Intellectual Disability', 'icon' => '🧠', 'category' => 'cognitive'],
            ['value' => 'mental_health', 'label' => 'Mental Health Condition', 'icon' => '🧘', 'category' => 'psychosocial'],
            ['value' => 'multiple', 'label' => 'Multiple Disabilities', 'icon' => '🔄', 'category' => 'multiple'],
            ['value' => 'albinism', 'label' => 'Albinism', 'icon' => '✨', 'category' => 'other'],
            ['value' => 'other', 'label' => 'Other Disability', 'icon' => '📌', 'category' => 'other'],
        ];
    }
}

if (!function_exists('getDisabilityTypeByValue')) {
    function getDisabilityTypeByValue(string $value): ?array
    {
        $types = getDisabilityTypes();

        foreach ($types as $type) {
            if ($type['value'] === $value) {
                return $type;
            }
        }

        return null;
    }
}

if (!function_exists('getDisabilityTypesByCategory')) {
    function getDisabilityTypesByCategory(string $category): array
    {
        return array_filter(getDisabilityTypes(), function ($type) use ($category) {
            return $type['category'] === $category;
        });
    }
}

if (!function_exists('getDisabilityCategories')) {
    function getDisabilityCategories(): array
    {
        $categories = [];

        foreach (getDisabilityTypes() as $type) {
            $categories[] = $type['category'];
        }

        return array_unique($categories);
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Age Range Options Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getAgeRangeOptions')) {
    function getAgeRangeOptions(): array
    {
        return [
            ['value' => '0-16', 'label' => '0-16 years'],
            ['value' => '17-35', 'label' => '17-35 years'],
            ['value' => '36-60', 'label' => '36-60 years'],
            ['value' => '60+', 'label' => '60+ years'],
        ];
    }
}

if (!function_exists('getAgeRangeLabel')) {
    function getAgeRangeLabel(string $value): string
    {
        $options = getAgeRangeOptions();

        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }

        return $value;
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Gender Options Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getGenderOptions')) {
    function getGenderOptions(): array
    {
        return [
            ['value' => 'male', 'label' => 'Male'],
            ['value' => 'female', 'label' => 'Female'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }
}

if (!function_exists('getGenderLabel')) {
    function getGenderLabel(string $value): string
    {
        $options = getGenderOptions();

        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }

        return ucfirst($value);
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Relationship Options Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getRelationshipOptions')) {
    function getRelationshipOptions(): array
    {
        return [
            ['value' => 'spouse', 'label' => 'Spouse/Partner'],
            ['value' => 'family_member', 'label' => 'Family Member'],
            ['value' => 'neighbour', 'label' => 'Neighbour'],
            ['value' => 'colleague', 'label' => 'Colleague'],
            ['value' => 'stranger', 'label' => 'Stranger'],
            ['value' => 'authority_figure', 'label' => 'Authority Figure'],
            ['value' => 'other', 'label' => 'Other'],
        ];
    }
}

if (!function_exists('getRelationshipLabel')) {
    function getRelationshipLabel(string $value): string
    {
        $options = getRelationshipOptions();

        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }

        return ucfirst(str_replace('_', ' ', $value));
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Generic Option Helpers
|--------------------------------------------------------------------------
*/

if (!function_exists('getOptionLabel')) {
    function getOptionLabel(array $options, string $value, string $fallback = null): string
    {
        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option['label'];
            }
        }

        return $fallback ?? ucfirst(str_replace('_', ' ', $value));
    }
}

if (!function_exists('getOptionsForSelect')) {
    function getOptionsForSelect(array $options): array
    {
        $selectOptions = [];

        foreach ($options as $option) {
            $selectOptions[$option['value']] = $option['label'];
        }

        return $selectOptions;
    }
}

if (!function_exists('validateOptionValue')) {
    function validateOptionValue(array $options, string $value): bool
    {
        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return true;
            }
        }

        return false;
    }
}

if (!function_exists('caseStatusOptions')) {
    function caseStatusOptions(): array
    {
        return [
            'reported' => [
                'label' => 'Reported',
                'color' => 'info',
                'icon' => '🚨'
            ],
            'under_investigation' => [
                'label' => 'Under Investigation',
                'color' => 'warning',
                'icon' => '⚠️'
            ],
            'medical_attention' => [
                'label' => 'Medical Attention',
                'color' => 'primary',
                'icon' => '🏥'
            ],
            'legal_proceedings' => [
                'label' => 'Legal Proceedings',
                'color' => 'danger',
                'icon' => '⚖️'
            ],
            'counselling' => [
                'label' => 'Counselling',
                'color' => 'info',
                'icon' => '💬'
            ],
            'shelter_provided' => [
                'label' => 'Shelter Provided',
                'color' => 'success',
                'icon' => '🏠'
            ],
        ];
    }
}

// Helper to get just values
if (!function_exists('caseStatusValues')) {
    function caseStatusValues(): array
    {
        return array_keys(caseStatusOptions());
    }
}

// Helper to get just labels
if (!function_exists('caseStatusLabels')) {
    function caseStatusLabels(): array
    {
        return array_map(fn($item) => $item['label'], caseStatusOptions());
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Conclusion Types Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getConclusionTypes')) {
    function getConclusionTypes(): array
    {
        return [
            [
                'value' => 'successful_prosecution',
                'label' => 'Successful Prosecution',
                'icon' => '⚖️',
                'color' => 'success'
            ],
            [
                'value' => 'out_of_court_settlement',
                'label' => 'Out of Court Settlement',
                'icon' => '🤝',
                'color' => 'info'
            ],
            [
                'value' => 'referred_to_other_agency',
                'label' => 'Referred to Other Agency',
                'icon' => '🔄',
                'color' => 'primary'
            ],
            [
                'value' => 'survivor_declined_further_action',
                'label' => 'Survivor Declined Further Action',
                'icon' => '🚫',
                'color' => 'warning'
            ],
            [
                'value' => 'insufficient_evidence',
                'label' => 'Insufficient Evidence',
                'icon' => '📋',
                'color' => 'danger'
            ],
            [
                'value' => 'survivor_relocated',
                'label' => 'Survivor Relocated',
                'icon' => '🏠',
                'color' => 'secondary'
            ],
            [
                'value' => 'other',
                'label' => 'Other',
                'icon' => '📌',
                'color' => 'secondary'
            ],
        ];
    }
}

if (!function_exists('getConclusionTypeByValue')) {
    function getConclusionTypeByValue(string $value): ?array
    {
        $types = getConclusionTypes();

        foreach ($types as $type) {
            if ($type['value'] === $value) {
                return $type;
            }
        }

        return null;
    }
}

if (!function_exists('getConclusionLabel')) {
    function getConclusionLabel(string $value): string
    {
        $type = getConclusionTypeByValue($value);
        return $type ? $type['label'] : ucfirst(str_replace('_', ' ', $value));
    }
}

if (!function_exists('getConclusionColor')) {
    function getConclusionColor(string $value): string
    {
        $type = getConclusionTypeByValue($value);
        return $type ? $type['color'] : 'secondary';
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Referral Type Management
|--------------------------------------------------------------------------
*/

if (!function_exists('getReferralTypes')) {
    function getReferralTypes(): array
    {
        return [
            [
                'value' => 'medical',
                'label' => 'Medical Attention',
                'icon' => '🏥',
                'color' => 'danger'
            ],
            [
                'value' => 'legal',
                'label' => 'Legal Proceedings',
                'icon' => '⚖️',
                'color' => 'primary'
            ],
            [
                'value' => 'psychosocial',
                'label' => 'Psychosocial Support',
                'icon' => '💬',
                'color' => 'info'
            ],
            [
                'value' => 'shelter',
                'label' => 'Shelter Provided',
                'icon' => '🏠',
                'color' => 'success'
            ],
            [
                'value' => 'economic',
                'label' => 'Economic Empowerment',
                'icon' => '💰',
                'color' => 'warning'
            ],
            [
                'value' => 'other',
                'label' => 'Other',
                'icon' => '📌',
                'color' => 'secondary'
            ],
        ];
    }
}

if (!function_exists('getReferralTypeByValue')) {
    function getReferralTypeByValue(string $value): ?array
    {
        $types = getReferralTypes();

        foreach ($types as $type) {
            if ($type['value'] === $value) {
                return $type;
            }
        }

        return null;
    }
}

if (!function_exists('getReferralLabel')) {
    function getReferralLabel(string $value): string
    {
        $type = getReferralTypeByValue($value);
        return $type ? $type['label'] : ucfirst(str_replace('_', ' ', $value));
    }
}

if (!function_exists('getReferralColor')) {
    function getReferralColor(string $value): string
    {
        $type = getReferralTypeByValue($value);
        return $type ? $type['color'] : 'secondary';
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Urgency Options (Enhanced)
|--------------------------------------------------------------------------
*/

if (!function_exists('getUrgencyOptions')) {
    function getUrgencyOptions(): array
    {
        return [
            [
                'value' => 'low',
                'label' => 'Low',
                'color' => 'secondary',
                'description' => 'Non-urgent, routine follow-up',
                'icon' => '📌'
            ],
            [
                'value' => 'normal',
                'label' => 'Normal',
                'color' => 'primary',
                'description' => 'Standard handling time',
                'icon' => '✓'
            ],
            [
                'value' => 'high',
                'label' => 'High',
                'color' => 'warning',
                'description' => 'Requires prompt attention',
                'icon' => '⚠️'
            ],
            [
                'value' => 'critical',
                'label' => 'Critical',
                'color' => 'danger',
                'description' => 'Immediate intervention needed',
                'icon' => '🚨'
            ],
        ];
    }
}

if (!function_exists('getUrgencyByValue')) {
    function getUrgencyByValue(string $value): ?array
    {
        $options = getUrgencyOptions();

        foreach ($options as $option) {
            if ($option['value'] === $value) {
                return $option;
            }
        }

        return null;
    }
}

if (!function_exists('getUrgencyLabel')) {
    function getUrgencyLabel(string $value): string
    {
        $urgency = getUrgencyByValue($value);
        return $urgency ? $urgency['label'] : ucfirst($value);
    }
}

if (!function_exists('getUrgencyColor')) {
    function getUrgencyColor(string $value): string
    {
        $urgency = getUrgencyByValue($value);
        return $urgency ? $urgency['color'] : 'secondary';
    }
}