<?php

namespace App\Services;

use App\Models\Survivor;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class SurvivorTimelineService
{
    /**
     * Get the complete timeline for a survivor.
     */
    public function getTimeline(Survivor $survivor): Collection
    {
        $timeline = collect();

        // Add registration event
        $timeline->push($this->buildRegistrationEvent($survivor));

        // Add case creation events
        $timeline = $timeline->concat($this->buildCaseEvents($survivor));

        // Add consent events
        $timeline = $timeline->concat($this->buildConsentEvents($survivor));

        return $timeline
            ->sortByDesc('timestamp')
            ->values();
    }

    /**
     * Build the registration event.
     */
    protected function buildRegistrationEvent(Survivor $survivor): array
    {
        return [
            'type' => 'registration',
            'title' => 'Survivor Registered',
            'description' => 'Survivor was registered in the system',
            'user' => $survivor->creator?->name,
            'timestamp' => $survivor->created_at,
            'icon' => 'user-plus',
            'link' => null,
        ];
    }

    /**
     * Build events for all cases.
     */
    protected function buildCaseEvents(Survivor $survivor): Collection
    {
        return $survivor->cases->map(function ($case) {
            return [
                'type' => 'case_created',
                'title' => 'Case Created',
                'description' => "Case {$case->case_number} - {$case->incident_type}",
                'user' => $case->creator?->name,
                'timestamp' => $case->created_at,
                'icon' => 'folder-plus',
                'link' => $this->getCaseRoute($case),
            ];
        });
    }

    /**
     * Build consent-related events.
     */
    protected function buildConsentEvents(Survivor $survivor): Collection
    {
        $events = collect();
        $consentDetails = $survivor->consent_details;

        if (!$consentDetails) {
            return $events;
        }

        if (isset($consentDetails['renewed_at'])) {
            $events->push([
                'type' => 'consent_renewed',
                'title' => 'Consent Renewed',
                'description' => 'Survivor renewed consent',
                'user' => null,
                'timestamp' => $consentDetails['renewed_at'],
                'icon' => 'check-circle',
                'link' => null,
            ]);
        }

        if (isset($consentDetails['withdrawn_at'])) {
            $events->push([
                'type' => 'consent_withdrawn',
                'title' => 'Consent Withdrawn',
                'description' => 'Survivor withdrew consent',
                'user' => null,
                'timestamp' => $consentDetails['withdrawn_at'],
                'icon' => 'x-circle',
                'link' => null,
            ]);
        }

        return $events;
    }

    /**
     * Get the route for a case.
     */
    protected function getCaseRoute($case): ?string
    {
        try {
            return route('gbv-cases.show', $case);
        } catch (\Exception $e) {
            return null;
        }
    }
}
