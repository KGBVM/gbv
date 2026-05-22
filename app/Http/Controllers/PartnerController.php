<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Http\Requests\Partner\StoreRequest;
use App\Models\OrganizationType;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Yajra\DataTables\Facades\DataTables;
use Inertia\Inertia;

class PartnerController extends Controller
{
    private ?User $userInstance = null;

    private function user(): User
    {
        return $this->userInstance ??= Auth::user();
    }

    /**
     * Display a listing of partners.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Partner::class);

        try {
            if ($request->has('draw')) {
                $query = Partner::with([
                    'type',
                    'county',
                    'subCounty',
                    'ward',
                    'village',
                    'users'
                ])->withCount([
                            'users as total_users_count',
                            'cases as total_cases_count'
                        ]);

                // Check user role/permissions
                if (!$this->user()->hasRole('admin')) {
                    // If not admin, only show partners relevant to the user
                    if ($this->user()->partner_id) {
                        $query->where('id', $this->user()->partner_id);
                    } elseif ($this->user()->isGbvOfficer()) {
                        $query->where('id', $this->user()->partner_id);
                    }
                }

                // Search filter
                if ($request->filled('search.value')) {
                    $search = $request->input('search.value');
                    $query->where(function ($q) use ($search) {
                        $q->where('organization_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('registration_number', 'like', "%{$search}%");
                    });
                }

                // Status filter
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                // Organization type filter
                if ($request->filled('organization_type_id')) {
                    $query->where('organization_type_id', $request->organization_type_id);
                }

                return DataTables::of($query)
                    ->addColumn('partner_info', fn($row) => view('backend.partners.partner_info', compact('row'))->render())
                    ->addColumn('user_case_stats', fn($row) => view('backend.partners.user_case_stats', compact('row'))->render())
                    ->addColumn('referrals_stats', fn($row) => view('backend.partners.referrals_stats', compact('row'))->render())
                    ->addColumn('date_created', fn($row) => view('backend.partners.date_created', compact('row'))->render())
                    ->addColumn('status', fn($row) => view('backend.partners.status', compact('row'))->render())
                    ->addColumn('actions', fn($row) => view('backend.partners.actions', compact('row'))->render())
                    ->rawColumns(['partner_info', 'user_case_stats', 'referrals_stats', 'date_created', 'status', 'actions'])
                    ->make(true);
            }

            // Get statistics for the dashboard
            $stats = $this->getStatistics();

            return Inertia::render('Partners/Index', [
                'stats' => $stats,
                'organizationTypes' => OrganizationType::all()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show form for creating a new partner.
     */
    public function create()
    {
        // Handled by public route
    }

    /**
     * Store a newly created partner.
     */
    public function store(StoreRequest $request)
    {
        try {
            DB::beginTransaction();

            // Prepare partner data
            $partnerData = $request->except([
                'password',
                'password_confirmation'
            ]);

            // Set additional data
            $partnerData['terms_accepted_at'] = now();
            $partnerData['status'] = 'pending'; // Default status
            $partnerData['verification_token'] = generatePartnerVerificationToken();

            // Add metadata
            $partnerData['metadata'] = array_merge($partnerData['metadata'] ?? [], [
                'registered_by' => Auth::id(),
                'registered_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Create the partner
            $partner = Partner::create($partnerData);

            // Create associated user account
            $user = $partner->users()->create([
                'name' => $request->contact_person,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'partner_id' => $partner->id,
            ]);

            // Assign role for GBV officer
            $user->assignRole('gbv_officer');

            // Log activity
            activity()
                ->performedOn($partner)
                ->withProperties([
                    'organization_name' => $partner->organization_name,
                    'user_id' => $user->id
                ])
                ->log('New partner registered');

            // Trigger event for user registration
            event(new Registered($user));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Partner registration submitted successfully. Please wait for approval.'
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Display the specified partner.
     */
    public function show(Partner $partner)
    {
        $this->authorize('view', $partner);

        try {
            $partner->load([
                'type',
                'county',
                'subCounty',
                'ward',
                'village',
                'users',
                'cases' => function ($query) {
                    $query->with(['primaryOfficer', 'caseFiles'])->latest()->limit(10);
                }
            ]);

            // Get statistics for this partner
            $partnerStats = [
                'total_users' => $partner->users->count(),
                'active_users' => $partner->users->where('is_active', true)->count(),
                'total_cases' => $partner->cases->count(),
                'active_cases' => $partner->cases->whereNotIn('status', ['concluded', 'closed'])->count(),
                'cases_by_status' => $partner->cases->groupBy('status')->map->count(),
                'cases_by_type' => $partner->cases->groupBy('incident_type')->map->count(),
            ];

            return Inertia::render('Partners/Show', [
                'partner' => $partner,
                'partnerStats' => $partnerStats,
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Show form for editing partner.
     */
    public function edit(Partner $partner)
    {
        $this->authorize('update', $partner);

        try {
            $partner->load([
                'type',
                'county',
                'subCounty',
                'ward',
                'village'
            ]);

            return Inertia::render('Partners/CreateEdit', [
                'partner' => $partner,
                'constants' => [
                    'organizationTypes' => OrganizationType::all()->pluck('name', 'id'),
                    'statusOptions' => [
                        'active' => 'Active',
                        'pending' => 'Pending',
                        'suspended' => 'Suspended',
                        'closed' => 'Closed',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified partner.
     */
    public function update(StoreRequest $request, Partner $partner)
    {
        $this->authorize('update', $partner);

        try {
            DB::beginTransaction();

            $data = $request->except(['password', 'password_confirmation']);

            // Update metadata
            $data['metadata'] = array_merge($partner->metadata ?? [], [
                'updated_by' => Auth::id(),
                'updated_at' => now(),
                'updated_ip' => $request->ip(),
            ]);

            // Handle status change approval
            if ($request->has('status') && $request->status !== $partner->status) {
                $data['metadata']['previous_status'] = $partner->status;
                $data['metadata']['status_changed_at'] = now();
                $data['metadata']['status_changed_by'] = Auth::id();

                // If approved, set verified_at
                if ($request->status === 'approved' && !$partner->verified_at) {
                    $data['verified_at'] = now();
                }
            }

            $partner->update($data);

            // Update associated user account if email or contact person changed
            if ($partner->users()->exists()) {
                $user = $partner->users()->first();
                $userData = [];

                if ($request->has('email') && $request->email !== $user->email) {
                    $userData['email'] = $request->email;
                }

                if ($request->has('contact_person') && $request->contact_person !== $user->name) {
                    $userData['name'] = $request->contact_person;
                }

                if (!empty($userData)) {
                    $user->update($userData);
                }
            }

            // Log activity
            activity()
                ->performedOn($partner)
                ->withProperties([
                    'organization_name' => $partner->organization_name,
                    'changes' => $data
                ])
                ->log('Partner information updated');

            DB::commit();

            return redirect()->route('partners.show', $partner)
                ->with('success', 'Partner information updated successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Remove the specified partner (soft delete).
     */
    public function destroy(Partner $partner)
    {
        $this->authorize('delete', $partner);

        try {
            // Check if partner has active cases
            $activeCases = $partner->cases()
                ->whereNotIn('status', ['concluded', 'closed'])
                ->count();

            if ($activeCases > 0) {
                return back()->with('error', 'Cannot delete partner with active cases.');
            }

            // Check if partner has active users
            $activeUsers = $partner->users()
                ->where('is_active', true)
                ->count();

            if ($activeUsers > 0) {
                return back()->with('error', 'Cannot delete partner with active users. Please deactivate users first.');
            }

            // Log before deletion
            activity()
                ->performedOn($partner)
                ->withProperties(['organization_name' => $partner->organization_name])
                ->log('Partner deleted');

            $partner->delete();

            return redirect()->route('partners.index')
                ->with('success', 'Partner record deleted successfully.');
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    /**
     * Get statistics for partner dashboard.
     */
    private function getStatistics(): array
    {
        try {
            $query = Partner::query();

            // // Apply role-based filtering for stats
            // if (!$this->user()->hasRole('admin')) {
            //     if ($this->user()->partner_id) {
            //         $query->where('id', $this->user()->partner_id);
            //     }
            // }

            return [
                'total' => $query->count(),
                'pending' => (clone $query)->where('status', 'pending')->count(),
                'approved' => (clone $query)->where('status', 'approved')->count(),
                'rejected' => (clone $query)->where('status', 'rejected')->count(),
                'active' => (clone $query)->where('status', 'approved')->whereNotNull('verified_at')->count(),
                'by_type' => Partner::select('organization_type_id', DB::raw('count(*) as total'))
                    ->whereNotNull('organization_type_id')
                    ->groupBy('organization_type_id')
                    ->with('type')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->type?->name ?? 'Unknown' => $item->total];
                    }),
                'by_county' => Partner::select('county_id', DB::raw('count(*) as total'))
                    ->whereNotNull('county_id')
                    ->with('county')
                    ->groupBy('county_id')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->county?->name ?? 'Unknown' => $item->total];
                    }),
                'recent_partners' => (clone $query)->latest()->limit(5)->get(),
            ];
        } catch (\Exception $e) {
            return [
                'total' => 0,
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
                'active' => 0,
                'by_type' => collect(),
                'by_county' => collect(),
                'recent_partners' => collect(),
            ];
        }
    }

    /**
     * Approve a partner.
     */
    public function approve(Request $request, Partner $partner)
    {
        $this->authorize('approve', $partner);

        try {
            DB::beginTransaction();

            $partner->update([
                'status' => 'approved',
                'verified_at' => now(),
                'metadata' => array_merge($partner->metadata ?? [], [
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_notes' => $request->notes,
                ]),
            ]);

            // Activate the associated user
            if ($user = $partner->users()->first()) {
                $user->update(['is_active' => true]);

                // Notify user about approval
                // You can add notification here
            }

            // Log activity
            activity()
                ->performedOn($partner)
                ->withProperties(['approved_by' => Auth::id()])
                ->log('Partner approved');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Partner approved successfully.'
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a partner.
     */
    public function reject(Request $request, Partner $partner)
    {
        $this->authorize('reject', $partner);

        try {
            DB::beginTransaction();

            $partner->update([
                'status' => 'rejected',
                'metadata' => array_merge($partner->metadata ?? [], [
                    'rejected_by' => Auth::id(),
                    'rejected_at' => now(),
                    'rejection_reason' => $request->reason,
                ]),
            ]);

            // Log activity
            activity()
                ->performedOn($partner)
                ->withProperties(['rejected_by' => Auth::id(), 'reason' => $request->reason])
                ->log('Partner rejected');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Partner rejected successfully.'
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
