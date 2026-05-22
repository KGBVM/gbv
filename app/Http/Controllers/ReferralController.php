<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Yajra\DataTables\Facades\DataTables;
use Inertia\Inertia;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Referral::with([
                    'gbvCase.survivor',
                    'fromPartner',
                    'toPartner'
                ])->where(function ($q) {
                    $q->where('from_partner_id', Auth::user()->partner_id)
                        ->orWhere('to_partner_id', Auth::user()->partner_id);
                });

                return DataTables::of($query)
                    ->addColumn('survivor_name', fn($row) => $row->gbvCase?->survivor?->getAnonymousName())
                    ->addColumn('case_number', fn($row) => $row->gbvCase?->case_number)
                    ->addColumn('status', fn($row) => view('backend.referrals.status', compact('row'))->render())
                    ->addColumn('priority', fn($row) => view('backend.referrals.priority', compact('row'))->render())
                    ->addColumn('actions', fn($row) => view('backend.referrals.actions', compact('row'))->render())
                    ->rawColumns(['survivor_name', 'case_number', 'status', 'priority', 'actions'])
                    ->make(true);
            }

            // Get statistics for dashboard
            $stats = $this->getRefferalStatistics();

            return Inertia::render('Referrals/Index', [
                'stats' => $stats,
            ]);
        } catch (\Throwable $th) {
            return back()->with('error', $th->getMessage());
        }
    }

    public function create(Request $request)
    {
        // Display the form for creating a new Referral
    }

    public function store(Request $request)
    {
        // Create a new Referral
    }

    public function show(Referral $referral)
    {
        // Display the details of a specific Referral
    }

    public function edit(Referral $referral)
    {
        // Display the form for editing an existing Referral
    }

    public function update(Request $request, Referral $referral)
    {
        // Update an existing Referral
    }

    public function destroy(Referral $referral)
    {
        // Delete a Referral
    }

    public function getRefferalStatistics()
    {
        return [
            [
                'title' => 'Total Refferals',
                'value' => Referral::count(),
                'icon' => 'collection',
                'color' => 'info',
            ],
            [
                'title' => 'Sent Refferals',
                'value' => Referral::where('from_partner_id', Auth::user()->partner_id)->count(),
                'icon' => 'clipboard-data',
                'color' => 'warning',
            ],
            [
                'title' => 'Received Refferals',
                'value' => Referral::where('to_partner_id', Auth::user()->partner_id)->count(),
                'icon' => 'clipboard-data',
                'color' => 'success',
            ],
            [
                'title' => 'Pending Refferals',
                'value' => Referral::where('to_partner_id', Auth::user()->partner_id)
                    ->where('status', 'pending')
                    ->count(),
                'icon' => 'clipboard-data',
                'color' => 'danger',
            ],
        ];
    }
}