<?php

namespace App\Http\Controllers;

use App\Models\GbvCase;
use App\Models\Referral;
use App\Models\Survivor;
use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GbvCasesExport;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index', [
            'reportTypes' => [
                'cases_summary' => 'Cases Summary Report',
                'demographics' => 'Survivor Demographics',
                'referrals' => 'Referrals Analysis',
                'incident_types' => 'Incident Types Analysis',
                'partner_performance' => 'Partner Performance',
                'monthly_trends' => 'Monthly Trends',
            ],
            'partners' => Partner::approved()->get(['id', 'organization_name']),
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'report_type' => 'required',
            'date_range' => 'required|array',
            'date_range.from' => 'required|date',
            'date_range.to' => 'required|date|after:from',
            'partner_id' => 'nullable|exists:partners,id',
        ]);

        $data = $this->generateReportData($request);

        return Inertia::render('Reports/Preview', [
            'reportData' => $data,
            'filters' => $request->all(),
        ]);
    }

    public function exportExcel(Request $request)
    {
        $request->validate([
            'report_type' => 'required',
            'date_range' => 'required|array',
        ]);

        $fileName = 'gbv_report_' . now()->format('Y_m_d_His') . '.xlsx';

        return Excel::download(new GbvCasesExport($request->all()), $fileName);
    }

    public function exportPdf(Request $request)
    {
        $request->validate([
            'report_type' => 'required',
            'date_range' => 'required|array',
        ]);

        $data = $this->generateReportData($request);

        $pdf = Pdf::loadView('reports.' . $request->report_type, $data);

        return $pdf->download('gbv_report_' . now()->format('Y_m_d_His') . '.pdf');
    }

    private function generateReportData(Request $request)
    {
        $from = $request->date_range['from'];
        $to = $request->date_range['to'];
        $partnerId = $request->partner_id;

        switch ($request->report_type) {
            case 'cases_summary':
                return $this->getCasesSummary($from, $to, $partnerId);

            case 'demographics':
                return $this->getDemographics($from, $to, $partnerId);

            case 'referrals':
                return $this->getReferralsAnalysis($from, $to, $partnerId);

            case 'incident_types':
                return $this->getIncidentTypes($from, $to, $partnerId);

            case 'partner_performance':
                return $this->getPartnerPerformance($from, $to);

            case 'monthly_trends':
                return $this->getMonthlyTrends($from, $to, $partnerId);

            default:
                return [];
        }
    }

    private function getCasesSummary($from, $to, $partnerId)
    {
        $query = GbvCase::whereBetween('created_at', [$from, $to]);

        if ($partnerId) {
            $query->whereHas('survivor', function ($q) use ($partnerId) {
                $q->whereHas('cases', function ($q) use ($partnerId) {
                    $q->whereHas('caseFiles', function ($q) use ($partnerId) {
                        $q->where('partner_id', $partnerId);
                    });
                });
            });
        }

        return [
            'total_cases' => $query->count(),
            'by_status' => $query->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_priority' => $query->selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
            'by_incident_type' => $query->selectRaw('incident_type, count(*) as count')
                ->groupBy('incident_type')
                ->pluck('count', 'incident_type'),
            'conclusion_rate' => $query->whereNotNull('concluded_at')->count() / max($query->count(), 1) * 100,
            'avg_resolution_days' => $query->whereNotNull('concluded_at')
                ->selectRaw('AVG(DATEDIFF(concluded_at, created_at)) as avg_days')
                ->value('avg_days'),
        ];
    }

    private function getDemographics($from, $to, $partnerId)
    {
        $query = Survivor::whereBetween('created_at', [$from, $to]);

        if ($partnerId) {
            $query->whereHas('cases', function ($q) use ($partnerId) {
                $q->whereHas('caseFiles', function ($q) use ($partnerId) {
                    $q->where('partner_id', $partnerId);
                });
            });
        }

        return [
            'by_age' => $query->selectRaw('age_bracket, count(*) as count')
                ->whereNotNull('age_bracket')
                ->groupBy('age_bracket')
                ->pluck('count', 'age_bracket'),
            'by_gender' => $query->selectRaw('gender, count(*) as count')
                ->whereNotNull('gender')
                ->groupBy('gender')
                ->pluck('count', 'gender'),
            'pwd_count' => $query->where('is_pwd', true)->count(),
            'by_location' => $query->selectRaw('county, count(*) as count')
                ->whereNotNull('county')
                ->groupBy('county')
                ->pluck('count', 'county'),
            'consent_rate' => $query->where('consent_given', true)->count() / max($query->count(), 1) * 100,
        ];
    }

    private function getReferralsAnalysis($from, $to, $partnerId)
    {
        $query = Referral::whereBetween('created_at', [$from, $to]);

        if ($partnerId) {
            $query->where(function ($q) use ($partnerId) {
                $q->where('from_partner_id', $partnerId)
                    ->orWhere('to_partner_id', $partnerId);
            });
        }

        return [
            'total' => $query->count(),
            'by_status' => $query->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_type' => $query->selectRaw('referral_type, count(*) as count')
                ->groupBy('referral_type')
                ->pluck('count', 'referral_type'),
            'by_urgency' => $query->selectRaw('urgency, count(*) as count')
                ->groupBy('urgency')
                ->pluck('count', 'urgency'),
            'avg_completion_days' => $query->whereNotNull('completed_at')
                ->selectRaw('AVG(DATEDIFF(completed_at, created_at)) as avg_days')
                ->value('avg_days'),
            'acceptance_rate' => $query->where('status', 'accepted')->count() / max($query->count(), 1) * 100,
            'top_receiving' => $query->selectRaw('to_partner_id, count(*) as count')
                ->groupBy('to_partner_id')
                ->with('toPartner')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
        ];
    }

    private function getIncidentTypes($from, $to, $partnerId)
    {
        $query = GbvCase::whereBetween('created_at', [$from, $to]);

        if ($partnerId) {
            $query->whereHas('caseFiles', function ($q) use ($partnerId) {
                $q->where('partner_id', $partnerId);
            });
        }

        return [
            'by_type' => $query->selectRaw('incident_type, count(*) as count')
                ->groupBy('incident_type')
                ->orderByDesc('count')
                ->pluck('count', 'incident_type'),
            'by_month' => $query->selectRaw('DATE_FORMAT(incident_date, "%Y-%m") as month, incident_type, count(*) as count')
                ->whereNotNull('incident_date')
                ->groupBy('month', 'incident_type')
                ->orderBy('month')
                ->get(),
            'by_location' => $query->selectRaw('incident_sub_county, incident_type, count(*) as count')
                ->whereNotNull('incident_sub_county')
                ->groupBy('incident_sub_county', 'incident_type')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
        ];
    }

    private function getPartnerPerformance($from, $to)
    {
        $partners = Partner::approved()->get();

        $performance = [];
        foreach ($partners as $partner) {
            $cases = GbvCase::whereHas('caseFiles', function ($q) use ($partner) {
                $q->where('partner_id', $partner->id);
            })->whereBetween('created_at', [$from, $to])->count();

            $referralsSent = Referral::where('from_partner_id', $partner->id)
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $referralsReceived = Referral::where('to_partner_id', $partner->id)
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $referralsCompleted = Referral::where('to_partner_id', $partner->id)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$from, $to])
                ->count();

            $performance[] = [
                'partner' => $partner->organization_name,
                'cases_handled' => $cases,
                'referrals_sent' => $referralsSent,
                'referrals_received' => $referralsReceived,
                'referrals_completed' => $referralsCompleted,
                'completion_rate' => $referralsReceived > 0 ? ($referralsCompleted / $referralsReceived) * 100 : 0,
            ];
        }

        return $performance;
    }

    private function getMonthlyTrends($from, $to, $partnerId)
    {
        $query = GbvCase::whereBetween('created_at', [$from, $to]);

        if ($partnerId) {
            $query->whereHas('caseFiles', function ($q) use ($partnerId) {
                $q->where('partner_id', $partnerId);
            });
        }

        $monthly = $query->selectRaw('
            DATE_FORMAT(created_at, "%Y-%m") as month,
            count(*) as total_cases,
            sum(case when status in ("concluded", "closed") then 1 else 0 end) as concluded,
            sum(case when priority = "critical" then 1 else 0 end) as critical
        ')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $monthly;
    }
}