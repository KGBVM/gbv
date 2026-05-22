// Dashboard/GbvOfficer.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Row, Col, Card, Badge, Button, Tabs, Tab, Spinner } from "react-bootstrap";
import { Clock, TrendingUp, Users, ChevronRight, Plus, Eye } from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Line,
    Area,
    ComposedChart,
    Legend,
} from "recharts";
import { Head, Link, usePage, router } from "@inertiajs/react";
import StatsCard from "@/Components/ui/StatsCard";
import DataTableComponent from "@/Components/ui/DataTable";

// Chart colors configuration
const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f97316",
    danger: "#ef4444",
    info: "#8b5cf6",
};

// Gradient definitions for charts
const ChartGradients = () => (
    <defs>
        <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="resolutionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
        </linearGradient>
    </defs>
);

// Cases table columns configuration
const getCasesColumns = (onViewCase) => [
    {
        data: "case_id",
        title: "Case ID",
        className: "fw-semibold",
        render: (data, type, row) => {
            if (type !== "display") return row.case_id;
            return `<span class="fw-semibold text-primary">${row.case_id}</span>`;
        },
    },
    {
        data: "survivor_name",
        title: "Survivor Name",
        render: (data, type, row) => {
            if (type !== "display") return row.survivor_name;
            return `<div class="d-flex align-items-center">
                <div class="avatar-sm bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                    <span class="fw-bold small">${row.survivor_name.charAt(0)}</span>
                </div>
                <span>${row.survivor_name}</span>
            </div>`;
        },
    },
    {
        data: "incident_type",
        title: "Incident Type",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.incident_type;
            const variants = {
                "Physical assault": "danger",
                "Sexual violence": "danger",
                "Emotional abuse": "warning",
                "Economic abuse": "info",
                Neglect: "secondary",
            };
            const variant = variants[row.incident_type] || "primary";
            return `<span class="badge bg-${variant}-soft text-${variant} rounded-pill">${row.incident_type}</span>`;
        },
    },
    {
        data: "status",
        title: "Status",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.status;
            const badgeClass = row.status === "Closed" ? "success" : row.status === "In Progress" ? "warning" : row.status === "On Hold" ? "danger" : "secondary";
            return `<span class="badge rounded-pill bg-${badgeClass}">${row.status}</span>`;
        },
    },
    {
        data: "priority",
        title: "Priority",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.priority;
            const priorityClass = row.priority === "High" ? "danger" : row.priority === "Medium" ? "warning" : "success";
            return `<div class="d-flex justify-content-center">
                <span class="badge rounded-pill bg-${priorityClass}-soft text-${priorityClass}">${row.priority}</span>
            </div>`;
        },
    },
    {
        data: "created_at",
        title: "Created Date",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.created_at;
            return `<div class="text-center small">${new Date(row.created_at).toLocaleDateString()}</div>`;
        },
    },
    {
        data: "days_open",
        title: "Days Open",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.days_open;
            const variant = row.days_open > 30 ? "danger" : row.days_open > 15 ? "warning" : "success";
            return `<div class="text-center">
                <span class="badge bg-${variant}-soft text-${variant} rounded-pill">${row.days_open} days</span>
            </div>`;
        },
    },
    {
        data: null,
        title: "Action",
        className: "text-center",
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
            if (type !== "display") return "";
            return `<button class="btn btn-sm btn-outline-primary" onclick="window.viewCase('${row.case_id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View
            </button>`;
        },
    },
];

// Referrals table columns configuration
const getReferralsColumns = (onViewReferral) => [
    {
        data: "id",
        title: "Referral ID",
        className: "fw-semibold",
        render: (data, type, row) => {
            if (type !== "display") return row.id;
            return `<span class="fw-semibold">#${row.id}</span>`;
        },
    },
    {
        data: "service_type",
        title: "Service Type",
        render: (data, type, row) => row.service_type,
    },
    {
        data: "referred_to",
        title: "Referred To",
        render: (data, type, row) => row.referred_to,
    },
    {
        data: "status",
        title: "Status",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.status;
            const badgeClass = row.status === "Completed" ? "success" : "warning";
            return `<span class="badge rounded-pill bg-${badgeClass}">${row.status}</span>`;
        },
    },
    {
        data: "created_at",
        title: "Created",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.created_at;
            return new Date(row.created_at).toLocaleDateString();
        },
    },
    {
        data: "completed_at",
        title: "Completed",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.completed_at;
            return row.completed_at ? new Date(row.completed_at).toLocaleDateString() : "-";
        },
    },
    {
        data: null,
        title: "Action",
        className: "text-center",
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
            if (type !== "display") return "";
            return `<button class="btn btn-sm btn-link text-decoration-none" onclick="window.viewReferral('${row.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                View Details
            </button>`;
        },
    },
];

// Recent activities columns
const getRecentActivitiesColumns = () => [
    {
        data: "activity_type",
        title: "Activity",
        className: "fw-semibold",
        render: (data, type, row) => {
            if (type !== "display") return row.activity_type;
            const icons = {
                "Case Created": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success me-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
                "Case Updated": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-info me-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
                "Referral Made": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-warning me-1"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
                "Referral Completed": '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success me-1"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            };
            const icon = icons[row.activity_type] || "";
            return `<div class="d-flex align-items-center">${icon} <span>${row.activity_type}</span></div>`;
        },
    },
    {
        data: "description",
        title: "Description",
        render: (data, type, row) => row.description,
    },
    {
        data: "case_id",
        title: "Case ID",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.case_id;
            return row.case_id ? `<span class="text-primary">${row.case_id}</span>` : "-";
        },
    },
    {
        data: "user",
        title: "User",
        render: (data, type, row) => row.user || "-",
    },
    {
        data: "created_at",
        title: "Date/Time",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.created_at;
            return `<div class="small">
                ${new Date(row.created_at).toLocaleDateString()}<br/>
                <small class="text-muted">${new Date(row.created_at).toLocaleTimeString()}</small>
            </div>`;
        },
    },
];

export default function GbvOfficer({ dashboardData = {} }) {
    const { auth } = usePage().props;
    const {
        statsCardsData = [],
        casesTrends = [],
        caseResolutionTrends = [],
        referrals = { pending: [], completed: [] },
        recentCases = [],
        recentReferrals = [],
        recentActivities = [],
    } = dashboardData;

    const [activeTab, setActiveTab] = useState("overview");
    const [timeRange, setTimeRange] = useState("6months");
    const [isLoading, setIsLoading] = useState(false);

    // Calculate case statistics
    const caseStats = useMemo(() => {
        const total = statsCardsData.find((card) => card.title === "My Cases")?.value || 0;
        const active = statsCardsData.find((card) => card.title === "Active Cases")?.value || 0;
        const closed = statsCardsData.find((card) => card.title === "Closed Cases")?.value || 0;
        const completionRate = total > 0 ? ((closed / total) * 100).toFixed(1) : 0;
        const avgResolutionDays = statsCardsData.find((card) => card.title === "Avg. Resolution Time")?.value || 0;

        return { total, active, closed, completionRate, avgResolutionDays };
    }, [statsCardsData]);

    // Prepare trend data based on time range
    const filteredResolutionData = useMemo(() => {
        const data = caseResolutionTrends || [];
        if (timeRange === "3months") return data.slice(-3);
        if (timeRange === "6months") return data.slice(-6);
        return data;
    }, [caseResolutionTrends, timeRange]);

    // Handle view case
    const handleViewCase = useCallback((caseId) => {
        router.visit(route("cases.show", { case: caseId }));
    }, []);

    // Handle view referral
    const handleViewReferral = useCallback((referralId) => {
        router.visit(route("referrals.show", { referral: referralId }));
    }, []);

    // Handle new case
    const handleNewCase = useCallback(() => {
        router.visit(route("cases.create"));
    }, []);

    // Register global functions for DataTable buttons
    useEffect(() => {
        window.viewCase = handleViewCase;
        window.viewReferral = handleViewReferral;
        return () => {
            delete window.viewCase;
            delete window.viewReferral;
        };
    }, [handleViewCase, handleViewReferral]);

    // Memoized columns
    const casesColumns = useMemo(() => getCasesColumns(handleViewCase), [handleViewCase]);
    const referralsColumns = useMemo(() => getReferralsColumns(handleViewReferral), [handleViewReferral]);
    const activitiesColumns = useMemo(() => getRecentActivitiesColumns(), []);

    const referralSuccessRate = useMemo(() => {
        const total = (referrals.pending?.length || 0) + (referrals.completed?.length || 0);
        if (total === 0) return 0;
        return Math.round(((referrals.completed?.length || 0) / total) * 100);
    }, [referrals]);

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <div className="d-flex justify-content-center align-items-center min-vh-50">
                    <Spinner animation="border" variant="primary" />
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="GBV Officer Dashboard" />

            {/* Welcome Card */}
            <Card className="border-0 shadow-sm mb-4 bg-primary bg-gradient text-white">
                <Card.Body className="py-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h4 className="mb-2 fw-bold">
                                Welcome back, {auth?.user?.name?.split(" ")[0] || "Officer"}!
                            </h4>
                            <h6 className="opacity-90 mb-1">{auth?.user?.partner?.organization_name || "GBV Response Unit"}</h6>
                            <p className="mb-0 opacity-75 mt-2">
                                You have <strong>{caseStats.active}</strong> active cases that need attention.
                            </p>
                        </div>
                        <div className="text-end">
                            <div className="display-6 fw-bold mb-0">{caseStats.completionRate}%</div>
                            <small className="opacity-75">Completion Rate</small>
                            <div className="mt-2">
                                <small className="opacity-75 d-flex align-items-center gap-1">
                                    <Clock size={14} />
                                    Avg. {caseStats.avgResolutionDays} days resolution
                                </small>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Key Metrics */}
            <Row className="g-3 mb-4">
                {statsCardsData.map((card, index) => (
                    <Col md={3} key={card.title || index}>
                        <StatsCard {...card} />
                    </Col>
                ))}
            </Row>

            {/* Tabs Section */}
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 border-bottom">
                <Tab eventKey="overview" title="Overview">
                    <Row className="g-3 mt-2">
                        {/* Case Trends Chart */}
                        <Col lg={7}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h5 className="fw-bold mb-0">Case & Resolution Trends</h5>
                                        <div className="d-flex gap-2">
                                            {[
                                                { value: "3months", label: "3M" },
                                                { value: "6months", label: "6M" },
                                                { value: "year", label: "1Y" },
                                            ].map((range) => (
                                                <Button
                                                    key={range.value}
                                                    variant={timeRange === range.value ? "primary" : "light"}
                                                    size="sm"
                                                    onClick={() => setTimeRange(range.value)}
                                                    className="rounded-pill"
                                                >
                                                    {range.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <ComposedChart data={filteredResolutionData}>
                                            <ChartGradients />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="month" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: "white",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="resolved"
                                                stroke={CHART_COLORS.success}
                                                fill="url(#resolutionGradient)"
                                                strokeWidth={2}
                                                name="Resolved Cases"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="pending"
                                                stroke={CHART_COLORS.primary}
                                                strokeWidth={3}
                                                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2 }}
                                                name="Pending Cases"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Quick Stats */}
                        <Col lg={5}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <h5 className="fw-bold mb-0">Performance Overview</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Case Completion Rate</span>
                                            <span className="fw-bold">{caseStats.completionRate}%</span>
                                        </div>
                                        <div className="progress" style={{ height: "8px" }}>
                                            <div
                                                className="progress-bar bg-success"
                                                style={{ width: `${caseStats.completionRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Referral Success Rate</span>
                                            <span className="fw-bold">{referralSuccessRate}%</span>
                                        </div>
                                        <div className="progress" style={{ height: "8px" }}>
                                            <div
                                                className="progress-bar bg-info"
                                                style={{ width: `${referralSuccessRate}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="border rounded p-3 text-center">
                                                <Users size={24} className="text-primary mb-2" />
                                                <div className="h5 mb-0 fw-bold">{caseStats.total}</div>
                                                <small className="text-muted">Total Cases</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="border rounded p-3 text-center">
                                                <TrendingUp size={24} className="text-success mb-2" />
                                                <div className="h5 mb-0 fw-bold">{referrals.completed?.length || 0}</div>
                                                <small className="text-muted">Referrals Completed</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-2">
                                        <Button
                                            variant="primary"
                                            onClick={handleNewCase}
                                            className="w-100 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <Plus size={16} />
                                            Create New Case
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Cases Table */}
                    <Row className="g-3 mt-2">
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">Recent Cases</h5>
                                        <Link href={route("gbv-cases.index")} className="text-decoration-none small d-flex align-items-center gap-1">
                                            View All <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <DataTableComponent
                                        id="recent-cases-table"
                                        columns={casesColumns}
                                        data={recentCases}
                                        serverSide={false}
                                        pagination={true}
                                        searching={true}
                                        striped={true}
                                        hover={true}
                                        pageLength={10}
                                        emptyStateText="No cases found"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="cases" title="All Cases">
                    <Card className="border-0 shadow-sm mt-2">
                        <Card.Header className="bg-white border-0 pt-4 px-4">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <h5 className="fw-bold mb-0">Case Management</h5>
                                <Button variant="primary" size="sm" onClick={handleNewCase} className="d-flex align-items-center gap-2">
                                    <Plus size={14} />
                                    New Case
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <DataTableComponent
                                id="all-cases-table"
                                columns={casesColumns}
                                data={recentCases}
                                serverSide={true}
                                pagination={true}
                                searching={true}
                                striped={true}
                                hover={true}
                                pageLength={25}
                                emptyStateText="No cases found"
                            />
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="referrals" title="Referrals">
                    <Row className="g-3 mt-2">
                        <Col xs={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="fw-bold mb-0">Referral Management</h5>
                                        <Badge bg="info" className="rounded-pill">
                                            Total: {(referrals.pending?.length || 0) + (referrals.completed?.length || 0)}
                                        </Badge>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <DataTableComponent
                                        id="referrals-table"
                                        columns={referralsColumns}
                                        data={recentReferrals}
                                        serverSide={false}
                                        pagination={true}
                                        searching={true}
                                        striped={true}
                                        hover={true}
                                        pageLength={10}
                                        emptyStateText="No referrals found"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="recent" title="Recent Activity">
                    <Card className="border-0 shadow-sm mt-2">
                        <Card.Header className="bg-white border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-0">Activity Log</h5>
                        </Card.Header>
                        <Card.Body>
                            <DataTableComponent
                                id="activities-table"
                                columns={activitiesColumns}
                                data={recentActivities}
                                serverSide={false}
                                pagination={true}
                                searching={true}
                                striped={true}
                                hover={true}
                                pageLength={15}
                                order={[[4, "desc"]]}
                                emptyStateText="No recent activities"
                            />
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </AuthenticatedLayout>
    );
}