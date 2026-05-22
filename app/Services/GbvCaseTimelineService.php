<?php

namespace App\Services;

use App\Models\GbvCase;
use Illuminate\Support\Collection;

class GbvCaseTimelineService
{
    /**
     * Get the complete timeline for a GBV case.
     */
    public function getTimeline(GbvCase $gbvCase): Collection
    {
        $timeline = collect();

        // Add case creation event
        $timeline->push($this->buildCreationEvent($gbvCase));

        // Add perpetrator events
        $timeline = $timeline->concat($this->buildPerpetratorEvents($gbvCase));

        // Add status change events
        $timeline = $timeline->concat($this->buildStatusChangeEvents($gbvCase));

        // Add conclusion event if applicable
        if ($gbvCase->concluded_at) {
            $timeline->push($this->buildConclusionEvent($gbvCase));
        }

        return $timeline
            ->sortByDesc('timestamp')
            ->values();
    }

    /**
     * Build the case creation event.
     */
    protected function buildCreationEvent(GbvCase $gbvCase): array
    {
        return [
            'type' => 'case_created',
            'title' => 'Case Created',
            'description' => "GBV case {$gbvCase->case_number} was created",
            'user' => $gbvCase->creator?->name,
            'timestamp' => $gbvCase->created_at,
            'icon' => 'folder-plus',
            'link' => null,
        ];
    }

    /**
     * Build perpetrator-related events.
     */
    protected function buildPerpetratorEvents(GbvCase $gbvCase): Collection
    {
        return $gbvCase->perpetrators->map(function ($perpetrator) {
            $description = "Perpetrator added";

            if ($perpetrator->name_known && $perpetrator->name) {
                $description .= ": {$perpetrator->name}";
            }

            if ($perpetrator->relationship) {
                $description .= " (Relationship: " . str_replace('_', ' ', $perpetrator->relationship) . ")";
            }

            return [
                'type' => 'perpetrator_added',
                'title' => 'Perpetrator Added',
                'description' => $description,
                'user' => $perpetrator->creator?->name,
                'timestamp' => $perpetrator->created_at,
                'icon' => 'user-minus',
                'link' => null,
            ];
        });
    }

    /**
     * Build status change events.
     */
    protected function buildStatusChangeEvents(GbvCase $gbvCase): Collection
    {
        return $gbvCase->timelines
            ->where('type', 'status_change')
            ->map(function ($timeline) {
                $metadata = $timeline->metadata ?? [];
                $oldStatus = ucwords(str_replace('_', ' ', $metadata['old_status'] ?? 'unknown'));
                $newStatus = ucwords(str_replace('_', ' ', $metadata['new_status'] ?? 'unknown'));

                return [
                    'type' => 'status_changed',
                    'title' => 'Status Updated',
                    'description' => "Status changed from {$oldStatus} to {$newStatus}",
                    'user' => $timeline->creator?->name,
                    'timestamp' => $timeline->created_at,
                    'icon' => 'refresh-cw',
                    'link' => null,
                ];
            });
    }

    /**
     * Build the conclusion event.
     */
    protected function buildConclusionEvent(GbvCase $gbvCase): array
    {
        $conclusionType = ucwords(str_replace('_', ' ', $gbvCase->conclusion_type ?? 'concluded'));

        return [
            'type' => 'case_concluded',
            'title' => 'Case Concluded',
            'description' => "Case concluded - {$conclusionType}",
            'user' => $gbvCase->concludedBy?->name,
            'timestamp' => $gbvCase->concluded_at,
            'icon' => 'check-circle',
            'link' => null,
        ];
    }
}