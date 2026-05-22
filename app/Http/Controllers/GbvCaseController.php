<?php

namespace App\Http\Controllers;

use App\Http\Requests\GbvCase\StoreRequest;
use App\Http\Requests\GbvCase\UpdateRequest;
use App\Models\GbvCase;
use App\Models\Partner;
use App\Models\Referral;
use App\Models\Survivor;
use App\Models\User;
use App\Services\GbvCaseTimelineService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class GbvCaseController extends Controller
{
    protected GbvCaseTimelineService $timelineService;

    private ?User $userInstance = null;

    private function user(): User
    {
        return $this->userInstance ??= Auth::user();
    }

    public function __construct(GbvCaseTimelineService $timelineService)
    {
        $this->timelineService = $timelineService;
    }

    /**
     * Display a listing of GBV cases.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', GbvCase::class);

        try {
            if ($request->has('draw')) {
                $query = GbvCase::with([
                    'survivor',
                    'primaryOfficer',
                    'creator',
                ]);

                // Check if GBV officer
                if ($this->user()->isGbvOfficer()) {
                    $query->where('partner_id', $this->user()->partner_id);
                } else {
                    // By partner
                    if ($request->filled('partner_id')) {
                        $query->where('partner_id', $request->partner_id);
                    }
                }

                // By status
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                // By priority
                if ($request->filled('priority')) {
                    $query->where('priority', $request->priority);
                }

                // By incident type
                if ($request->filled('incident_type')) {
                    $query->where('incident_type', $request->incident_type);
                }

                // By date range
                if ($request->filled('date_from')) {
                    $query->whereDate('incident_date', '>=', $request->date_from);
                }
                if ($request->filled('date_to')) {
                    $query->whereDate('incident_date', '<=', $request->date_to);
                }

                return DataTables::of($query)
                    ->addColumn('case_number', fn($row) => view('backend.gbv-cases.case_number', compact('row'))->render())
                    ->addColumn('survivor_name', fn($row) => view('backend.gbv-cases.survivor_name', compact('row'))->render())
                    ->editColumn('incident_type', fn($row) => view('backend.gbv-cases.incident_type', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.gbv-cases.status', compact('row'))->render())
                    ->addColumn('priority', fn($row) => view('backend.gbv-cases.priority', compact('row'))->render())
                    ->addColumn('date_created', fn($row) => view('backend.gbv-cases.date_created', compact('row'))->render())
                    ->addColumn('actions', fn($row) => view('backend.gbv-cases.actions', compact('row'))->render())
                    ->rawColumns(['case_number', 'survivor_name', 'incident_type', 'status', 'priority', 'date_created', 'actions'])
                    ->make(true);
            }

            return Inertia::render('GbvCases/Index', [
                'stats' => $this->statsCards(),
                'constants' => [
                    'incidentTypes' => getIncidentTypes(),
                    'priorityLevels' => getPriorityLevels(),
                    'confidentialityLevels' => getConfidentialityLevels(),
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                    'relationshipOptions' => getRelationshipOptions(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show form for creating a new GBV case.
     */
    public function create()
    {
        $this->authorize('create', GbvCase::class);

        try {
            return Inertia::render('GbvCases/CreateEdit', [
                'constants' => [
                    'incidentTypes' => getIncidentTypes(),
                    'priorityLevels' => getPriorityLevels(),
                    'confidentialityLevels' => getConfidentialityLevels(),
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                    'relationshipOptions' => getRelationshipOptions(),
                ],
                'survivors' => $this->getAccessibleSurvivors(),
                'officers' => $this->getAccessibleOfficers(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created GBV case.
     */
    public function store(StoreRequest $request)
    {
        $this->authorize('create', GbvCase::class);

        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Generate unique case number
            $data['case_number'] = generateCaseNumber();
            $data['created_by'] = Auth::id();

            // Add partner id
            $user = Auth::user();
            if ($user->partner_id) {
                $data['partner_id'] = $user->partner_id;
            }

            // Set default status
            $data['status'] = 'reported';

            // Handle consent for sensitive cases
            if (isset($data['is_sensitive']) && $data['is_sensitive'] && isset($data['consent_obtained']) && $data['consent_obtained']) {
                $data['consent_obtained_at'] = now();
                $data['consent_details'] = json_encode([  // Convert array to JSON string
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'consent_version' => '1.0',
                ]);
            } else {
                // Ensure consent_details is null if not applicable
                $data['consent_details'] = null;
            }

            // Remove consent_obtained_at if not needed (it's not in your original data)
            if (!isset($data['consent_obtained_at'])) {
                unset($data['consent_obtained_at']);
            }

            $gbvCase = GbvCase::create($data);

            // Handle perpetrators if provided
            if (isset($data['perpetrators']) && is_array($data['perpetrators'])) {
                foreach ($data['perpetrators'] as $perpetrator) {
                    $perpetrator['created_by'] = Auth::id();
                    $gbvCase->perpetrators()->create($perpetrator);
                }
            }

            // Log activity
            activity()
                ->performedOn($gbvCase)
                ->causedBy(Auth::user())
                ->withProperties([
                    'case_number' => $gbvCase->case_number,
                    'incident_type' => $gbvCase->incident_type,
                ])
                ->log('New GBV case registered');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'GBV case created successfully.',
                'data' => $gbvCase
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create GBV case: ' . $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified GBV case.
     */
    public function show(GbvCase $gbvCase)
    {
        $this->authorize('view', $gbvCase);

        try {
            $gbvCase->load([
                'survivor',
                'primaryOfficer',
                'creator',
                'concludedBy',
                'perpetrators',
                'files' => function ($query) {
                    $query->latest();
                },
                'referrals' => function ($query) {
                    $query->with('partner')->latest();
                },
                'notes' => function ($query) {
                    $query->with('author')->latest();
                },
            ]);

            return Inertia::render('GbvCases/Show', [
                'gbvCase' => $gbvCase,
                'timeline' => $this->timelineService->getTimeline($gbvCase),
                'partners' => Partner::whereNot('id', $gbvCase->partner_id)->get(['id', 'organization_name']),
                'caseStatusOptions' => caseStatusOptions(),
                'conclusionTypes' => getConclusionTypes(),
                'referralTypes' => getReferralTypes(),
                'urgencyOptions' => getUrgencyOptions(),
                'canEdit' => $this->user()->can('update', $gbvCase),
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Show form for editing the specified GBV case.
     */
    public function edit(GbvCase $gbvCase)
    {
        $this->authorize('update', $gbvCase);

        try {
            $gbvCase->load(['perpetrators']);

            return Inertia::render('GbvCases/CreateEdit', [
                'gbvCase' => $gbvCase,
                'constants' => [
                    'incidentTypes' => getIncidentTypes(),
                    'priorityLevels' => getPriorityLevels(),
                    'confidentialityLevels' => getConfidentialityLevels(),
                    'ageRangeOptions' => getAgeRangeOptions(),
                    'genderOptions' => getGenderOptions(),
                    'relationshipOptions' => getRelationshipOptions(),
                ],
                'survivors' => $this->getAccessibleSurvivors(),
                'officers' => $this->getAccessibleOfficers(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified GBV case.
     */
    public function update(UpdateRequest $request, GbvCase $gbvCase)
    {
        $this->authorize('update', $gbvCase);

        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Handle consent update for sensitive cases
            if ($request->has('consent_obtained')) {
                if ($request->consent_obtained && !$gbvCase->consent_obtained) {
                    $data['consent_obtained_at'] = now();
                    $data['consent_details'] = [
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                        'consent_version' => '1.0',
                        'previous_consent' => $gbvCase->consent_obtained,
                    ];
                } elseif (!$request->consent_obtained && $gbvCase->consent_obtained) {
                    $data['consent_obtained_at'] = null;
                    $data['consent_details'] = array_merge($gbvCase->consent_details ?? [], [
                        'revoked_at' => now(),
                        'revoked_by_ip' => $request->ip(),
                    ]);
                }
            }

            // Update perpetrators if provided
            if (isset($data['perpetrators'])) {
                $gbvCase->perpetrators()->delete();
                foreach ($data['perpetrators'] as $perpetrator) {
                    $perpetrator['created_by'] = Auth::id();
                    $gbvCase->perpetrators()->create($perpetrator);
                }
                unset($data['perpetrators']);
            }

            $gbvCase->update($data);

            DB::commit();

            return redirect()->route('gbv-cases.show', $gbvCase)
                ->with('success', 'GBV case updated successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Remove the specified GBV case (soft delete).
     */
    public function destroy(GbvCase $gbvCase)
    {
        $this->authorize('delete', $gbvCase);

        try {
            // Check if case has active referrals
            $activeReferrals = $gbvCase->referrals()
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->count();

            if ($activeReferrals > 0) {
                return back()->with('error', 'Cannot delete case with active referrals.');
            }

            // Soft delete related records
            $gbvCase->perpetrators()->delete();
            $gbvCase->timelines()->delete();

            $caseNumber = $gbvCase->case_number;
            $gbvCase->delete();

            return redirect()->route('gbv-cases.index')
                ->with('success', 'GBV case deleted successfully.');
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Update case status.
     */
    public function updateStatus(Request $request, GbvCase $gbvCase)
    {
        $this->authorize('update', $gbvCase);

        try {
            $request->validate([
                'status' => 'required|in:' . implode(',', caseStatusValues())
            ]);

            $oldStatus = $gbvCase->status;
            $newStatus = $request->status;

            $gbvCase->update(['status' => $newStatus]);

            // Log activity
            activity()
                ->performedOn($gbvCase)
                ->causedBy(Auth::user())
                ->withProperties([
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ])
                ->log('Case status updated');

            return response()->json([
                'success' => true,
                'message' => 'Case status updated successfully.',
                'status' => $newStatus,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Conclude a GBV case.
     */
    public function conclude(Request $request, GbvCase $gbvCase)
    {
        $this->authorize('update', $gbvCase);

        try {
            $request->validate([
                'conclusion_type' => 'required|in:resolved,referred_outside,withdrawn,unable_to_assist',
                'conclusion_notes' => 'nullable|string|max:1000',
            ]);

            $gbvCase->update([
                'status' => 'concluded',
                'conclusion_type' => $request->conclusion_type,
                'conclusion_notes' => $request->conclusion_notes,
                'concluded_at' => now(),
                'concluded_by' => Auth::id(),
            ]);

            // Log activity
            activity()
                ->performedOn($gbvCase)
                ->causedBy(Auth::user())
                ->withProperties([
                    'conclusion_type' => $request->conclusion_type,
                ])
                ->log('Case concluded');

            return redirect()->route('gbv-cases.show', $gbvCase)
                ->with('success', 'Case concluded successfully.');
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Get statistics cards for dashboard
     */
    private function statsCards(): array
    {
        $baseQuery = GbvCase::query();

        // Apply partner filter for non-admin users
        if ($this->user()->isGbvOfficer()) {
            $baseQuery->where('partner_id', $this->user()->partner_id);
        }

        return [
            [
                'title' => 'Total Cases',
                'value' => (clone $baseQuery)->count(),
                'icon' => 'folder2-open',
                'color' => 'primary',
            ],
            [
                'title' => 'Active Cases',
                'value' => (clone $baseQuery)
                    ->whereNotIn('status', ['concluded', 'closed'])
                    ->count(),
                'icon' => 'clipboard-data',
                'color' => 'warning',
            ],
            [
                'title' => 'Critical Cases',
                'value' => (clone $baseQuery)
                    ->where('priority', 'critical')
                    ->whereNotIn('status', ['concluded', 'closed'])
                    ->count(),
                'icon' => 'exclamation-triangle',
                'color' => 'danger',
            ],
            [
                'title' => 'Pending Referrals',
                'value' => Referral::where('status', 'pending')
                    ->whereHas('gbvCase', function ($query) use ($baseQuery) {
                        $query->whereIn('id', (clone $baseQuery)->pluck('id'));
                    })
                    ->count(),
                'icon' => 'send',
                'color' => 'info',
            ],
        ];
    }

    /**
     * Get accessible survivors for the current user.
     */
    private function getAccessibleSurvivors()
    {
        $query = Survivor::query();

        // GBV officers can only see survivors from their partner
        if ($this->user()->isGbvOfficer()) {
            $query->where('partner_id', $this->user()->partner_id);
        }

        return $query->select(['id', 'full_name', 'unique_code', 'gender', 'age_bracket', 'anonymous'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($survivor) {
                return [
                    'id' => $survivor->id,
                    'full_name' => $survivor->anonymous ? 'Anonymous Survivor' : $survivor->full_name,
                    'name' => $survivor->anonymous ? 'Anonymous' : $survivor->full_name,
                    'gender' => $survivor->gender,
                    'age_bracket' => $survivor->age_bracket,
                ];
            });
    }

    /**
     * Get accessible officers for the current user.
     */
    private function getAccessibleOfficers()
    {
        $query = User::where('is_active', true)
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['admin', 'gbv_officer', 'case_worker']);
            });

        // GBV officers can only see officers from their partner
        if ($this->user()->isGbvOfficer()) {
            $query->where('partner_id', $this->user()->partner_id);
        }

        return $query->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get()
            ->map(function ($officer) {
                return [
                    'id' => $officer->id,
                    'name' => $officer->name,
                    'email' => $officer->email,
                ];
            });
    }
}