<?php

namespace App\Http\Controllers;

use App\Models\GbvCase;
use App\Models\Partner;
use App\Models\Referral;
use App\Models\SubCounty;
use App\Models\Survivor;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private ?User $userInstance = null;

    private function user(): User
    {
        return $this->userInstance ??= Auth::user();
    }

    public function index()
    {
        $role = $this->user()->roles()->first()?->name;

        abort_if(!$role, 403, 'No role assigned to user.');

        // Map role to dashboard component name
        $component = match ($role) {
            'super_admin' => 'Dashboard/SuperAdmin',
            'admin' => 'Dashboard/Admin',
            'gbv_officer' => 'Dashboard/GbvOfficer',
            default => 'Dashboard/Viewer',
        };

        return Inertia::render($component, [
            'dashboardData' => $this->getDashboardData($role)
        ]);
    }

    private function getDashboardData(string $role): array
    {
        return match ($role) {
            'super_admin' => $this->getSuperAdminData(),
            'admin' => $this->getAdminData(),
            'gbv_officer' => $this->getGbvOfficerData(),
            default => $this->getViewerData(),
        };
    }

    /* ===================================================
     | SUPER ADMIN DATA
     =================================================== */
    private function getSuperAdminData(): array
    {
        return [
            'statsCardsData' => $this->getGlobalStats(),
            'caseTrends' => $this->getGlobalCaseTrends(),
            'caseTrendsByType' => $this->getGlobalCaseTrendsByType(),
            'ageDisaggregation' => $this->getGlobalAgeDisaggregation(),
            'pwdStatistics' => $this->getGlobalPwdStatistics(),
            'geographicDistribution' => $this->getGlobalGeographicDistribution(),
            'subcounties' => SubCounty::select('id', 'name')->orderBy('name')->get(),
        ];
    }

    /* ===================================================
     | ADMIN DATA
     =================================================== */
    private function getAdminData(): array
    {
        $user = $this->user();
        $countyId = $user->county_id;

        return [
            'statsCardsData' => $this->getRegionalStats($countyId),
            'caseTrends' => $this->getRegionalCaseTrends($countyId),
            'caseTrendsByType' => $this->getRegionalCaseTrendsByType($countyId),
            'ageDisaggregation' => $this->getRegionalAgeDisaggregation($countyId),
            'pwdStatistics' => $this->getRegionalPwdStatistics($countyId),
            'geographicDistribution' => $this->getRegionalGeographicDistribution($countyId),
            'subcounties' => SubCounty::where('county_id', $countyId)->select('id', 'name')->orderBy('name')->get(),
        ];
    }

    /* ===================================================
     | GBV OFFICER DATA
     =================================================== */
    private function getGbvOfficerData(): array
    {
        $user = $this->user();
        $partnerId = $user->partner_id;

        return [
            'statsCardsData' => $this->getOfficerStats($partnerId),
            'casesTrends' => $this->getOfficerCasesTrends($partnerId),
            'caseResolutionTrends' => $this->getOfficerResolutionTrends($partnerId),
            'referrals' => $this->getOfficerReferrals($partnerId),
            'recentCases' => $this->getOfficerRecentCases($partnerId),
            'recentReferrals' => $this->getOfficerRecentReferrals($partnerId),
            'recentActivities' => $this->getOfficerRecentActivities($partnerId),
        ];
    }

    private function getViewerData(): array
    {
        return $this->getGbvOfficerData();
    }

    /* ===================================================
     | GLOBAL STATS (Super Admin)
     =================================================== */
    private function getGlobalStats(): array
    {
        $totalCases = GbvCase::count();
        $activeCases = GbvCase::whereNotIn('status', ['closed', 'concluded'])->count();
        $totalSurvivors = Survivor::count();

        $casesWithReferrals = GbvCase::whereHas('referrals')->count();
        $referralRate = $totalCases > 0 ? round(($casesWithReferrals / $totalCases) * 100, 1) : 0;

        return [
            [
                'title' => 'Total Cases',
                'value' => $totalCases,
                'icon' => 'FileText',
                'color' => 'primary',
                'trend' => $this->calculateTrendPercentage(GbvCase::class),
            ],
            [
                'title' => 'Active Cases',
                'value' => $activeCases,
                'icon' => 'Activity',
                'color' => 'warning',
                'trend' => $this->calculateTrendPercentage(GbvCase::class, ['closed', 'concluded'], true),
            ],
            [
                'title' => 'Survivors',
                'value' => $totalSurvivors,
                'icon' => 'People',
                'color' => 'success',
                'trend' => $this->calculateTrendPercentage(Survivor::class),
            ],
            [
                'title' => 'Referral Rate',
                'value' => $referralRate,
                'icon' => 'Share',
                'color' => 'info',
                'suffix' => '%',
                'trend' => '0%',
            ],
        ];
    }

    private function getRegionalStats(?int $countyId): array
    {
        $query = GbvCase::query();
        if ($countyId) {
            $query->where('county_id', $countyId);
        }

        $totalCases = $query->count();
        $activeCases = (clone $query)->whereNotIn('status', ['closed', 'concluded'])->count();
        $totalSurvivors = Survivor::whereHas('cases', function ($q) use ($countyId) {
            if ($countyId)
                $q->where('county_id', $countyId);
        })->count();
        $totalPartners = Partner::count();

        return [
            [
                'title' => 'Total Cases',
                'value' => $totalCases,
                'icon' => 'FileText',
                'color' => 'primary',
            ],
            [
                'title' => 'Active Cases',
                'value' => $activeCases,
                'icon' => 'Activity',
                'color' => 'warning',
            ],
            [
                'title' => 'Survivors',
                'value' => $totalSurvivors,
                'icon' => 'Users',
                'color' => 'success',
            ],
            [
                'title' => 'Partners',
                'value' => $totalPartners,
                'icon' => 'Building2',
                'color' => 'info',
            ],
        ];
    }

    private function getOfficerStats(?int $partnerId): array
    {
        if (!$partnerId) {
            return $this->getEmptyStats();
        }

        $query = GbvCase::where('partner_id', $partnerId);
        $totalCases = $query->count();
        $activeCases = (clone $query)->whereNotIn('status', ['closed', 'concluded'])->count();
        $closedCases = (clone $query)->whereIn('status', ['closed', 'concluded'])->count();

        $avgResolutionDays = (clone $query)
            ->whereNotNull('concluded_at')
            ->select(DB::raw('AVG(DATEDIFF(concluded_at, created_at)) as avg_days'))
            ->value('avg_days') ?? 0;

        return [
            [
                'title' => 'My Cases',
                'value' => $totalCases,
                'icon' => 'FileText',
                'color' => 'primary',
            ],
            [
                'title' => 'Active Cases',
                'value' => $activeCases,
                'icon' => 'Activity',
                'color' => 'warning',
            ],
            [
                'title' => 'Closed Cases',
                'value' => $closedCases,
                'icon' => 'CheckCircle',
                'color' => 'success',
            ],
            [
                'title' => 'Avg. Resolution Time',
                'value' => round($avgResolutionDays),
                'icon' => 'Clock',
                'color' => 'info',
                'suffix' => ' days',
            ],
        ];
    }

    private function getEmptyStats(): array
    {
        return [
            ['title' => 'My Cases', 'value' => 0, 'icon' => 'FileText', 'color' => 'primary'],
            ['title' => 'Active Cases', 'value' => 0, 'icon' => 'Activity', 'color' => 'warning'],
            ['title' => 'Closed Cases', 'value' => 0, 'icon' => 'CheckCircle', 'color' => 'success'],
            ['title' => 'Avg. Resolution Time', 'value' => 0, 'icon' => 'Clock', 'color' => 'info', 'suffix' => ' days'],
        ];
    }

    /* ===================================================
     | CASE TRENDS
     =================================================== */
    private function getGlobalCaseTrends(): array
    {
        $months = $this->getLast12Months();

        $results = GbvCase::select(
            DB::raw('YEAR(gbv_cases.created_at) as year'),
            DB::raw('MONTH(gbv_cases.created_at) as month'),
            DB::raw('COUNT(*) as cases'),
            DB::raw('SUM(CASE WHEN gbv_cases.status IN ("concluded", "closed") THEN 1 ELSE 0 END) as resolved'),
            DB::raw('COUNT(DISTINCT CASE WHEN referrals.id IS NOT NULL THEN gbv_cases.id END) as referrals')
        )
            ->leftJoin('referrals', 'gbv_cases.id', '=', 'referrals.gbv_case_id')
            ->where('gbv_cases.created_at', '>=', now()->subMonths(12))
            ->whereNull('gbv_cases.deleted_at')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT));

        return collect($months)->map(function ($monthData) use ($results) {
            $key = $monthData['year'] . '-' . str_pad($monthData['month'], 2, '0', STR_PAD_LEFT);
            $data = $results->get($key);

            return [
                'month' => $monthData['label'],
                'cases' => $data->cases ?? 0,
                'resolved' => $data->resolved ?? 0,
                'referrals' => $data->referrals ?? 0,
            ];
        })->values()->toArray();
    }

    private function getRegionalCaseTrends(?int $countyId): array
    {
        $months = $this->getLast12Months();

        $query = GbvCase::select(
            DB::raw('YEAR(gbv_cases.created_at) as year'),
            DB::raw('MONTH(gbv_cases.created_at) as month'),
            DB::raw('COUNT(*) as cases'),
            DB::raw('SUM(CASE WHEN gbv_cases.status IN ("concluded", "closed") THEN 1 ELSE 0 END) as resolved')
        )
            ->where('gbv_cases.created_at', '>=', now()->subMonths(12))
            ->whereNull('gbv_cases.deleted_at');

        if ($countyId) {
            $query->where('gbv_cases.county_id', $countyId);
        }

        $results = $query->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT));

        return collect($months)->map(function ($monthData) use ($results) {
            $key = $monthData['year'] . '-' . str_pad($monthData['month'], 2, '0', STR_PAD_LEFT);
            $data = $results->get($key);

            return [
                'month' => $monthData['label'],
                'cases' => $data->cases ?? 0,
                'resolved' => $data->resolved ?? 0,
            ];
        })->values()->toArray();
    }

    private function getOfficerCasesTrends(?int $partnerId): array
    {
        if (!$partnerId) {
            return $this->getEmptyTrends();
        }

        $months = $this->getLast12Months();

        $results = GbvCase::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->where('partner_id', $partnerId)
            ->where('created_at', '>=', now()->subMonths(12))
            ->whereNull('deleted_at')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT));

        return collect($months)->map(function ($monthData) use ($results) {
            $key = $monthData['year'] . '-' . str_pad($monthData['month'], 2, '0', STR_PAD_LEFT);
            $data = $results->get($key);

            return [
                'month' => $monthData['month'],
                'total' => $data->total ?? 0,
            ];
        })->values()->toArray();
    }

    private function getOfficerResolutionTrends(?int $partnerId): array
    {
        if (!$partnerId) {
            return $this->getEmptyResolutionTrends();
        }

        $months = $this->getLast12Months();

        $results = GbvCase::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(CASE WHEN status IN ("concluded", "closed") THEN 1 ELSE 0 END) as resolved'),
            DB::raw('SUM(CASE WHEN status NOT IN ("concluded", "closed") THEN 1 ELSE 0 END) as pending')
        )
            ->where('partner_id', $partnerId)
            ->where('created_at', '>=', now()->subMonths(12))
            ->whereNull('deleted_at')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy(fn($item) => $item->year . '-' . str_pad($item->month, 2, '0', STR_PAD_LEFT));

        return collect($months)->map(function ($monthData) use ($results) {
            $key = $monthData['year'] . '-' . str_pad($monthData['month'], 2, '0', STR_PAD_LEFT);
            $data = $results->get($key);

            return [
                'month' => $monthData['month'],
                'resolved' => $data->resolved ?? 0,
                'pending' => $data->pending ?? 0,
            ];
        })->values()->toArray();
    }

    /* ===================================================
     | CASE DISTRIBUTION BY TYPE
     =================================================== */
    private function getGlobalCaseTrendsByType(): array
    {
        $colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

        return GbvCase::select('incident_type', DB::raw('COUNT(*) as value'))
            ->whereNotNull('incident_type')
            ->whereNull('deleted_at')
            ->groupBy('incident_type')
            ->orderByDesc('value')
            ->limit(8)
            ->get()
            ->values()
            ->map(fn($item, $index) => [
                'name' => $item->incident_type,
                'value' => $item->value,
                'color' => $colors[$index % count($colors)],
            ])
            ->toArray();
    }

    private function getRegionalCaseTrendsByType(?int $countyId): array
    {
        $colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

        $query = GbvCase::select('incident_type', DB::raw('COUNT(*) as value'))
            ->whereNotNull('incident_type')
            ->whereNull('deleted_at');

        if ($countyId) {
            $query->where('county_id', $countyId);
        }

        return $query->groupBy('incident_type')
            ->orderByDesc('value')
            ->limit(8)
            ->get()
            ->values()
            ->map(fn($item, $index) => [
                'name' => $item->incident_type,
                'value' => $item->value,
                'color' => $colors[$index % count($colors)],
            ])
            ->toArray();
    }

    /* ===================================================
     | AGE DISAGGREGATION
     =================================================== */
    private function getGlobalAgeDisaggregation(): array
    {
        $colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

        $results = GbvCase::join('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->selectRaw("
                CASE
                    WHEN survivors.age_bracket < 18 THEN '0-17'
                    WHEN survivors.age_bracket BETWEEN 18 AND 24 THEN '18-24'
                    WHEN survivors.age_bracket BETWEEN 25 AND 34 THEN '25-34'
                    WHEN survivors.age_bracket BETWEEN 35 AND 49 THEN '35-49'
                    ELSE '50+'
                END as bracket,
                COUNT(*) as count
            ")
            ->whereNotNull('survivors.age_bracket')
            ->whereNull('gbv_cases.deleted_at')
            ->whereNull('survivors.deleted_at')
            ->groupBy('bracket')
            ->orderByRaw("FIELD(bracket, '0-17', '18-24', '25-34', '35-49', '50+')")
            ->get();

        return $results->values()->map(fn($row, $index) => [
            'bracket' => $row->bracket,
            'count' => $row->count,
            'color' => $colors[$index % count($colors)],
        ])->toArray();
    }

    private function getRegionalAgeDisaggregation(?int $countyId): array
    {
        $colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

        $query = GbvCase::join('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->selectRaw("
                CASE
                    WHEN survivors.age < 18 THEN '0-17'
                    WHEN survivors.age BETWEEN 18 AND 24 THEN '18-24'
                    WHEN survivors.age BETWEEN 25 AND 34 THEN '25-34'
                    WHEN survivors.age BETWEEN 35 AND 49 THEN '35-49'
                    ELSE '50+'
                END as bracket,
                COUNT(*) as count
            ")
            ->whereNotNull('survivors.age')
            ->whereNull('gbv_cases.deleted_at')
            ->whereNull('survivors.deleted_at');

        if ($countyId) {
            $query->where('gbv_cases.county_id', $countyId);
        }

        $results = $query->groupBy('bracket')
            ->orderByRaw("FIELD(bracket, '0-17', '18-24', '25-34', '35-49', '50+')")
            ->get();

        return $results->values()->map(fn($row, $index) => [
            'bracket' => $row->bracket,
            'count' => $row->count,
            'color' => $colors[$index % count($colors)],
        ])->toArray();
    }

    /* ===================================================
     | PWD STATISTICS
     =================================================== */
    private function getGlobalPwdStatistics(): array
    {
        $total = GbvCase::whereNull('deleted_at')->count();

        $pwd = GbvCase::join('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->where('survivors.is_pwd', 1)
            ->whereNull('gbv_cases.deleted_at')
            ->whereNull('survivors.deleted_at')
            ->count();

        return [
            ['type' => 'Persons with Disabilities', 'count' => $pwd, 'color' => '#ef4444'],
            ['type' => 'Non-PWD', 'count' => max(0, $total - $pwd), 'color' => '#22c55e'],
        ];
    }

    private function getRegionalPwdStatistics(?int $countyId): array
    {
        $query = GbvCase::whereNull('deleted_at');
        if ($countyId) {
            $query->where('county_id', $countyId);
        }
        $total = $query->count();

        $pwdQuery = GbvCase::join('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->where('survivors.is_pwd', 1)
            ->whereNull('gbv_cases.deleted_at')
            ->whereNull('survivors.deleted_at');
        if ($countyId) {
            $pwdQuery->where('gbv_cases.county_id', $countyId);
        }
        $pwd = $pwdQuery->count();

        return [
            ['type' => 'Persons with Disabilities', 'count' => $pwd, 'color' => '#ef4444'],
            ['type' => 'Non-PWD', 'count' => max(0, $total - $pwd), 'color' => '#22c55e'],
        ];
    }

    /* ===================================================
     | GEOGRAPHIC DISTRIBUTION
     =================================================== */
    private function getGlobalGeographicDistribution(): array
    {
        return GbvCase::join('sub_counties', 'gbv_cases.sub_county_id', '=', 'sub_counties.id')
            ->leftJoin('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->leftJoin('referrals', 'gbv_cases.id', '=', 'referrals.gbv_case_id')
            ->selectRaw("
                sub_counties.name as region,
                COUNT(DISTINCT gbv_cases.id) as cases,
                COUNT(DISTINCT survivors.id) as survivors,
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT gbv_cases.id) > 0 
                        THEN (COUNT(DISTINCT CASE WHEN referrals.id IS NOT NULL THEN gbv_cases.id END) * 100.0 / COUNT(DISTINCT gbv_cases.id))
                        ELSE 0 
                    END, 1
                ) as rate
            ")
            ->whereNull('gbv_cases.deleted_at')
            ->groupBy('sub_counties.id', 'sub_counties.name')
            ->orderByDesc('cases')
            ->get()
            ->toArray();
    }

    private function getRegionalGeographicDistribution(?int $countyId): array
    {
        $query = GbvCase::join('sub_counties', 'gbv_cases.sub_county_id', '=', 'sub_counties.id')
            ->leftJoin('survivors', 'gbv_cases.survivor_id', '=', 'survivors.id')
            ->leftJoin('referrals', 'gbv_cases.id', '=', 'referrals.gbv_case_id')
            ->selectRaw("
                sub_counties.name as region,
                COUNT(DISTINCT gbv_cases.id) as cases,
                COUNT(DISTINCT survivors.id) as survivors,
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT gbv_cases.id) > 0 
                        THEN (COUNT(DISTINCT CASE WHEN referrals.id IS NOT NULL THEN gbv_cases.id END) * 100.0 / COUNT(DISTINCT gbv_cases.id))
                        ELSE 0 
                    END, 1
                ) as rate
            ")
            ->whereNull('gbv_cases.deleted_at');

        if ($countyId) {
            $query->where('sub_counties.county_id', $countyId);
        }

        return $query->groupBy('sub_counties.id', 'sub_counties.name')
            ->orderByDesc('cases')
            ->get()
            ->toArray();
    }

    /* ===================================================
     | OFFICER REFERRALS & RECENT DATA
     =================================================== */
    private function getOfficerReferrals(?int $partnerId): array
    {
        if (!$partnerId) {
            return ['pending' => [], 'completed' => []];
        }

        $referrals = Referral::where('from_partner_id', $partnerId)
            ->with(['toPartner', 'gbvCase'])
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'pending' => $referrals->where('status', 'pending')->values()->toArray(),
            'completed' => $referrals->where('status', 'completed')->values()->toArray(),
        ];
    }

    private function getOfficerRecentCases(?int $partnerId): array
    {
        if (!$partnerId) {
            return [];
        }

        return GbvCase::with(['survivor'])
            ->where('partner_id', $partnerId)
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($case) => [
                'case_id' => $case->case_number ?? 'CASE-' . $case->id,
                'survivor_name' => $case->survivor?->full_name ?? 'Anonymous',
                'incident_type' => $case->incident_type ?? 'Not specified',
                'status' => ucfirst($case->status ?? 'New'),
                'priority' => $case->priority ?? 'Medium',
                'created_at' => $case->created_at?->toISOString(),
                'days_open' => $case->created_at ? now()->diffInDays($case->created_at) : 0,
            ])
            ->toArray();
    }

    private function getOfficerRecentReferrals(?int $partnerId): array
    {
        if (!$partnerId) {
            return [];
        }

        return Referral::where('from_partner_id', $partnerId)
            ->with(['toPartner', 'gbvCase'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($referral) => [
                'id' => $referral->id,
                'service_type' => $referral->referral_type ?? 'General',
                'referred_to' => $referral->toPartner?->organization_name ?? 'N/A',
                'status' => ucfirst($referral->status ?? 'Pending'),
                'created_at' => $referral->created_at?->toISOString(),
                'completed_at' => $referral->completed_at?->toISOString(),
            ])
            ->toArray();
    }

    private function getOfficerRecentActivities(?int $partnerId): array
    {
        if (!$partnerId) {
            return [];
        }

        $cases = GbvCase::where('partner_id', $partnerId)
            ->whereNull('deleted_at')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($case) => [
                'activity_type' => 'Case Updated',
                'description' => "Case {$case->case_number} was updated - Status: {$case->status}",
                'case_id' => $case->case_number ?? 'CASE-' . $case->id,
                'user' => auth()->user()?->name ?? 'System',
                'created_at' => $case->updated_at?->toISOString(),
            ]);

        $referrals = Referral::where('from_partner_id', $partnerId)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($referral) => [
                'activity_type' => $referral->status === 'completed' ? 'Referral Completed' : 'Referral Made',
                'description' => "Referral #{$referral->id} - {$referral->referral_type}",
                'case_id' => $referral->gbvCase?->case_number ?? null,
                'user' => auth()->user()?->name ?? 'System',
                'created_at' => $referral->updated_at?->toISOString(),
            ]);

        return $cases->concat($referrals)
            ->sortByDesc('created_at')
            ->take(15)
            ->values()
            ->toArray();
    }

    /* ===================================================
     | HELPER METHODS
     =================================================== */
    private function getLast12Months(): array
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = [
                'year' => $date->year,
                'month' => $date->month,
                'label' => $date->format('M Y'),
            ];
        }
        return $months;
    }

    private function calculateTrendPercentage(string $model, array $excludeStatuses = [], bool $exclude = false): string
    {
        $currentPeriod = $model::where('created_at', '>=', now()->subMonths(1));
        $previousPeriod = $model::whereBetween('created_at', [now()->subMonths(2), now()->subMonths(1)]);

        if ($model === GbvCase::class && !empty($excludeStatuses)) {
            if ($exclude) {
                $currentPeriod = $currentPeriod->whereNotIn('status', $excludeStatuses);
                $previousPeriod = $previousPeriod->whereNotIn('status', $excludeStatuses);
            } else {
                $currentPeriod = $currentPeriod->whereIn('status', $excludeStatuses);
                $previousPeriod = $previousPeriod->whereIn('status', $excludeStatuses);
            }
        }

        $current = $currentPeriod->count();
        $previous = $previousPeriod->count();

        if ($previous == 0)
            return '+0%';

        $change = (($current - $previous) / $previous) * 100;
        $sign = $change >= 0 ? '+' : '';

        return $sign . round($change, 1) . '%';
    }

    private function getEmptyTrends(): array
    {
        $months = $this->getLast12Months();
        return collect($months)->map(fn($monthData) => [
            'month' => $monthData['month'],
            'total' => 0,
        ])->values()->toArray();
    }

    private function getEmptyResolutionTrends(): array
    {
        $months = $this->getLast12Months();
        return collect($months)->map(fn($monthData) => [
            'month' => $monthData['month'],
            'resolved' => 0,
            'pending' => 0,
        ])->values()->toArray();
    }
}