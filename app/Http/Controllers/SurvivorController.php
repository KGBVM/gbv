<?php

namespace App\Http\Controllers;

use App\Http\Requests\Survivor\StoreRequest;
use App\Http\Requests\Survivor\UpdateRequest;
use App\Models\Survivor;
use App\Models\User;
use App\Services\SurvivorTimelineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class SurvivorController extends Controller
{
    protected SurvivorTimelineService $timelineService;

    private ?User $userInstance = null;

    private function user(): User
    {
        return $this->userInstance ??= Auth::user();
    }

    public function __construct(SurvivorTimelineService $timelineService)
    {
        $this->timelineService = $timelineService;
    }

    /**
     * Display a listing of survivors.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Survivor::class);

        try {
            if ($request->has('draw')) {
                $query = Survivor::with([
                    'county',
                    'subCounty',
                    'ward',
                    'village',
                    'creator',
                    'cases' => function ($query) {
                        $query->with(['primaryOfficer', 'caseFiles'])->latest();
                    },
                ]);

                // Check if Gbv officer
                if ($this->user()->isGbvOfficer()) {
                    $query->where('partner_id', $this->user()->partner_id);
                } else {
                    // By partner
                    if ($request->filled('partner_id')) {
                        $query->where('partner_id', $request->partner_id);
                    }
                }

                // By Age bracket
                if ($request->filled('age_bracket')) {
                    $query->where('age_bracket', $request->age_bracket);
                }

                // By Gender
                if ($request->filled('gender')) {
                    $query->where('gender', $request->gender);
                }

                // By pwd
                if ($request->filled('pwd')) {
                    $query->where('is_pwd', $request->pwd);
                }

                return DataTables::of($query)
                    ->addColumn('full_name', fn($row) => view('backend.survivors.full_name', compact('row'))->render())
                    ->addColumn('location', fn($row) => view('backend.survivors.location', compact('row'))->render())
                    ->addColumn('consent_given', fn($row) => view('backend.survivors.consent_given', compact('row'))->render())
                    ->addColumn('is_pwd', fn($row) => view('backend.survivors.is_pwd', compact('row'))->render())
                    ->addColumn('date_created', fn($row) => view('backend.survivors.date_created', compact('row'))->render())
                    ->addColumn('actions', fn($row) => view('backend.survivors.actions', compact('row'))->render())
                    ->rawColumns(['full_name', 'location', 'consent_given', 'is_pwd', 'date_created', 'actions'])
                    ->make(true);
            }

            return Inertia::render('Survivors/Index', [
                'stats' => $this->statsCards(),
                'constants' => [
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show form for creating a new survivor.
     */
    public function create()
    {
        $this->authorize('create', Survivor::class);

        try {
            return Inertia::render('Survivors/CreateEdit', [
                'constants' => [
                    'incidentTypes' => getIncidentTypes(),
                    'priorityLevels' => getPriorityLevels(),
                    'confidentialityLevels' => getConfidentialityLevels(),
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                    'relationshipOptions' => getRelationshipOptions(),
                    'disabilityTypes' => getDisabilityTypes(),
                    'idTypes' => getIdTypes(),
                ],
                'survivors' => Survivor::all(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created survivor.
     */
    public function store(StoreRequest $request)
    {
        $this->authorize('create', Survivor::class);

        try {
            $data = $request->validated();

            // Generate unique code for anonymous identification
            $data['unique_code'] = generateSurvivorCode();
            $data['created_by'] = Auth::id();

            // Add partner id
            $user = Auth::user();
            if ($user->partner_id) {
                $data['partner_id'] = $user->partner_id;
            }

            // Handle consent
            if ($request->consent_given) {
                $data['consent_given_at'] = now();
                $data['consent_details'] = [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'consent_version' => '1.0',
                ];
            }

            $survivor = Survivor::create($data);

            // Log activity
            activity()
                ->performedOn($survivor)
                ->withProperties(['unique_code' => $survivor->unique_code])
                ->log('New survivor registered');

            return response()->json([
                'success' => true,
                'message' => 'Survivor created successfully.',
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Display the specified survivor.
     */
    public function show(Survivor $survivor)
    {
        $this->authorize('view', $survivor);

        try {
            $survivor->load([
                'county',
                'subCounty',
                'ward',
                'village',
                'creator',
                'cases' => function ($query) {
                    $query->with(['primaryOfficer', 'caseFiles'])->latest();
                },
            ]);

            // Get case statistics for this survivor
            $caseStats = [
                'total' => $survivor->cases->count(),
                'active' => $survivor->cases->whereNotIn('status', ['concluded', 'closed'])->count(),
                'concluded' => $survivor->cases->whereIn('status', ['concluded', 'closed'])->count(),
                'by_type' => $survivor->cases->groupBy('incident_type')->map->count(),
                'by_status' => $survivor->cases->groupBy('status')->map->count(),
            ];

            return Inertia::render('Survivors/Show', [
                'survivor' => $survivor,
                'caseStats' => $caseStats,
                'timeline' => $this->timelineService->getTimeline($survivor),
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Show form for editing survivor.
     */
    public function edit(Survivor $survivor)
    {
        $this->authorize('update', $survivor);

        try {
            $survivor->load([
                'county',
                'subCounty',
                'ward',
                'village',
            ]);

            return Inertia::render('Survivors/CreateEdit', [
                'survivor' => $survivor,
                'constants' => [
                    'idTypes' => getIdTypes(),
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                    'disabilityTypes' => getDisabilityTypes(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified survivor.
     */
    public function update(UpdateRequest $request, Survivor $survivor)
    {
        $this->authorize('update', $survivor);

        try {
            $data = $request->validated();

            // Handle consent update
            if ($request->has('consent_given')) {
                if ($request->consent_given && !$survivor->consent_given) {
                    $data['consent_given_at'] = now();
                    $data['consent_details'] = [
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'consent_version' => '1.0',
                        'previous_consent' => $survivor->consent_given,
                    ];
                } elseif (!$request->consent_given && $survivor->consent_given) {
                    $data['consent_given_at'] = null;
                    $data['consent_details'] = array_merge($survivor->consent_details ?? [], [
                        'revoked_at' => now(),
                        'revoked_by_ip' => $request->ip(),
                    ]);
                }
            }

            $survivor->update($data);

            return redirect()->route('survivors.show', $survivor)
                ->with('success', 'Survivor information updated successfully.');
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Remove the specified survivor (soft delete).
     */
    public function destroy(Survivor $survivor)
    {
        $this->authorize('delete', $survivor);

        try {
            // Check if survivor has active cases
            $activeCases = $survivor->cases()
                ->whereNotIn('status', ['concluded', 'closed'])
                ->count();

            if ($activeCases > 0) {
                return back()->with('error', 'Cannot delete survivor with active cases.');
            }

            $survivor->delete();

            return redirect()->route('survivors.index')
                ->with('success', 'Survivor record deleted successfully.');
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    private function statsCards(): array
    {
        $base = Survivor::query();

        if ($this->user()->isGbvOfficer()) {
            $base->where('partner_id', $this->user()->partner_id);
        }

        // Get all counts in a single query when possible
        $survivors = $base->clone();
        $activeCasesCount = $survivors->whereHas('cases', function ($query) {
            $query->whereNotIn('status', ['concluded', 'closed']);
        })->count();

        return [
            [
                'title' => 'Total Survivors',
                'value' => $base->clone()->count(),
                'icon' => 'people-fill',
                'color' => 'primary',
            ],
            [
                'title' => 'With active cases',
                'value' => $activeCasesCount,
                'icon' => 'folder2-open',
                'color' => 'warning',
            ],
            [
                'title' => 'PWD',
                'value' => $base->clone()->where('is_pwd', 1)->count(),
                'icon' => 'universal-access-circle',
                'color' => 'danger',
            ],
            [
                'title' => 'Consent given',
                'value' => $base->clone()->where('consent_given', 1)->count(),
                'icon' => 'patch-check-fill',
                'color' => 'success',
            ],
        ];
    }
}
