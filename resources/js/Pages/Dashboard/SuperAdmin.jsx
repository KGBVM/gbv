// Dashboard/SuperAdmin.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { ChevronRight, Globe2, Download, Filter } from "lucide-react";
import {
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    ComposedChart,
} from "recharts";
import Select from "react-select";
import { Head, usePage, router } from "@inertiajs/react";
import StatsCard from "@/Components/ui/StatsCard";
import DataTableComponent from "@/Components/ui/DataTable";

// Chart colors configuration
const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f97316",
    danger: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
};

// Gradient definitions for charts
const ChartGradients = () => (
    <defs>
        <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
                offset="5%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0.3}
            />
            <stop
                offset="95%"
                stopColor={CHART_COLORS.primary}
                stopOpacity={0}
            />
        </linearGradient>
        <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
                offset="5%"
                stopColor={CHART_COLORS.success}
                stopOpacity={0.3}
            />
            <stop
                offset="95%"
                stopColor={CHART_COLORS.success}
                stopOpacity={0}
            />
        </linearGradient>
    </defs>
);

// Period options
const PERIOD_OPTIONS = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
];

// Geographic table columns
const getGeographicColumns = (onDrillDown) => [
    {
        data: "region",
        title: "Sub-County",
        className: "fw-semibold",
        render: (data, type, row) =>
            type === "display"
                ? `<span class="fw-semibold">${row.region}</span>`
                : row.region,
    },
    {
        data: "cases",
        title: "Total Cases",
        className: "text-center",
        render: (data, type, row) =>
            type === "display"
                ? `<div class="text-center fw-medium">${row.cases.toLocaleString()}</div>`
                : row.cases,
    },
    {
        data: "survivors",
        title: "Survivors",
        className: "text-center",
        render: (data, type, row) =>
            type === "display"
                ? `<div class="text-center">${row.survivors.toLocaleString()}</div>`
                : row.survivors,
    },
    {
        data: "rate",
        title: "Referral Rate",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.rate;
            const badgeClass =
                row.rate >= 90
                    ? "success"
                    : row.rate >= 80
                      ? "warning"
                      : "danger";
            return `<div class="text-center">
                <span class="badge rounded-pill bg-${badgeClass}">${row.rate}%</span>
            </div>`;
        },
    },
    {
        data: "rate",
        title: "Performance",
        className: "text-center",
        render: (data, type, row) => {
            if (type !== "display") return row.rate;
            const variant =
                row.rate >= 90
                    ? "success"
                    : row.rate >= 80
                      ? "warning"
                      : "danger";
            return `<div class="d-flex align-items-center justify-content-center gap-2">
                <div class="progress" style="width: 100px; height: 6px;">
                    <div class="progress-bar bg-${variant}" style="width: ${row.rate}%"></div>
                </div>
            </div>`;
        },
    },
    {
        data: null,
        title: "Action",
        className: "text-center",
        orderable: false,
        searchable: false,
        render: (data, type, row) =>
            type === "display"
                ? `<button class="btn btn-sm btn-outline-primary" onclick="window.drillDown('${row.region}')">
                    View Details
                   </button>`
                : "",
    },
];

export default function SuperAdmin({ dashboardData = {} }) {
    const {
        statsCardsData = [],
        caseTrends = [],
        caseTrendsByType = [],
        ageDisaggregation = [],
        pwdStatistics = [],
        geographicDistribution = [],
        subcounties = [],
    } = dashboardData;

    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [isLoading, setIsLoading] = useState(false);

    // Memoized region options
    const regionOptions = useMemo(
        () => [
            { value: "all", label: "All Regions" },
            ...subcounties.map((subcounty) => ({
                value: subcounty.id,
                label: subcounty.name,
            })),
        ],
        [subcounties],
    );

    // Memoized selected region value
    const selectedRegionValue = useMemo(
        () => ({
            value: selectedRegion,
            label:
                selectedRegion === "all"
                    ? "All Regions"
                    : subcounties.find((s) => s.id === selectedRegion)?.name ||
                      "All Regions",
        }),
        [selectedRegion, subcounties],
    );

    // Handle region filter change
    const handleRegionChange = useCallback((option) => {
        setIsLoading(true);
        setSelectedRegion(option.value);

        // Reload data with filter
        router.get(
            route("dashboard"),
            { region: option.value },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    }, []);

    // Handle drill down
    const handleDrillDown = useCallback((region) => {
        router.visit(route("subcounty.show", { subcounty: region }));
    }, []);

    // Handle export
    const handleExport = useCallback(() => {
        router.post(
            route("dashboard.export"),
            { region: selectedRegion, period: selectedPeriod },
            { preserveScroll: true },
        );
    }, [selectedRegion, selectedPeriod]);

    // Register global drill down function
    useEffect(() => {
        window.drillDown = handleDrillDown;
        return () => {
            delete window.drillDown;
        };
    }, [handleDrillDown]);

    // Memoized geographic columns
    const geographicColumns = useMemo(
        () => getGeographicColumns(handleDrillDown),
        [handleDrillDown],
    );

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
            <Head title="Super Admin Dashboard" />

            <div className="super-admin-dashboard">
                {/* Header with Global Controls */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-1">Super Admin Dashboard</h3>
                        <p className="text-secondary mb-0 d-flex align-items-center gap-2">
                            <Globe2 size={16} />
                            System-wide overview and analytics
                        </p>
                    </div>
                    <div className="d-flex gap-2 mt-2 mt-sm-0">
                        <Select
                            options={regionOptions}
                            value={selectedRegionValue}
                            onChange={handleRegionChange}
                            className="min-width-200"
                            isDisabled={isLoading}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={handleExport}
                            className="d-flex align-items-center gap-2"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Key Metrics Row */}
                <Row className="g-3 mb-4">
                    {statsCardsData.map((card, index) => (
                        <Col xl={3} lg={6} md={6} key={card.title || index}>
                            <StatsCard {...card} />
                        </Col>
                    ))}
                </Row>

                {/* Charts Row */}
                <Row className="g-3 mb-4">
                    <Col xl={8}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <h5 className="fw-bold mb-0">
                                        System-wide Case Trends
                                    </h5>
                                    <div className="d-flex gap-2">
                                        {PERIOD_OPTIONS.map((period) => (
                                            <Button
                                                key={period.value}
                                                variant={
                                                    selectedPeriod ===
                                                    period.value
                                                        ? "primary"
                                                        : "light"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedPeriod(
                                                        period.value,
                                                    )
                                                }
                                                className="rounded-pill"
                                            >
                                                {period.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={caseTrends}>
                                        <ChartGradients />
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#6b7280"
                                        />
                                        <YAxis stroke="#6b7280" />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0 4px 12px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="cases"
                                            stroke={CHART_COLORS.primary}
                                            fill="url(#casesGradient)"
                                            strokeWidth={2}
                                            name="New Cases"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="resolved"
                                            stroke={CHART_COLORS.success}
                                            fill="url(#resolvedGradient)"
                                            strokeWidth={2}
                                            name="Resolved"
                                        />
                                        <Bar
                                            dataKey="referrals"
                                            barSize={20}
                                            fill={CHART_COLORS.warning}
                                            name="Referrals"
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xl={4}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <h5 className="fw-bold mb-0">
                                    Case Distribution by Type
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={caseTrendsByType}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name} ${(percent * 100).toFixed(0)}%`
                                            }
                                            labelLine={false}
                                        >
                                            {caseTrendsByType.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Demographics Row */}
                <Row className="g-3 mb-4">
                    <Col xl={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <h5 className="fw-bold mb-0">
                                    Age Disaggregation
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ageDisaggregation}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="bracket"
                                            stroke="#6b7280"
                                        />
                                        <YAxis stroke="#6b7280" />
                                        <RechartsTooltip />
                                        <Bar
                                            dataKey="count"
                                            fill={CHART_COLORS.primary}
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {ageDisaggregation.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xl={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <h5 className="fw-bold mb-0">
                                    PWD Statistics by Type
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={pwdStatistics}
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis type="number" stroke="#6b7280" />
                                        <YAxis
                                            dataKey="type"
                                            type="category"
                                            stroke="#6b7280"
                                            width={120}
                                        />
                                        <RechartsTooltip />
                                        <Bar
                                            dataKey="count"
                                            radius={[0, 4, 4, 0]}
                                        >
                                            {pwdStatistics.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Geographic Distribution */}
                <Row className="g-3 mb-4">
                    <Col xl={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold m-0">
                                        Geographic Distribution by Sub-County
                                    </h5>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <DataTableComponent
                                    id="geographic-distribution-table"
                                    columns={geographicColumns}
                                    data={geographicDistribution}
                                    serverSide={false}
                                    pagination={true}
                                    searching={true}
                                    striped={true}
                                    hover={true}
                                    pageLength={10}
                                    emptyStateText="No geographic data found"
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </AuthenticatedLayout>
    );
}
