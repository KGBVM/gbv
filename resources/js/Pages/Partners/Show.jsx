import React, { useMemo, useState, useRef, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    ButtonGroup,
    Button,
    Badge,
    Tabs,
    Tab,
    ProgressBar,
} from "react-bootstrap";
import {
    BiBuilding,
    BiMailSend,
    BiPhone,
    BiMap,
    BiCalendar,
    BiUser,
    BiCheckCircle,
    BiXCircle,
    BiTime,
    BiTrendingUp,
    BiGroup,
    BiFolderOpen,
    BiUserPlus,
    BiArrowToLeft,
    BiEditAlt,
    BiGlobe,
} from "react-icons/bi";
import { FaRegHandshake } from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";
import { GiOrganigram } from "react-icons/gi";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import DataTableComponent from "@/Components/ui/DataTable";

const ShowPartner = ({ partner, partnerStats }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const casesTableRef = useRef(null);
    const usersTableRef = useRef(null);

    // Format date helper
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Status badge configuration
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                variant: "warning",
                icon: <MdPending />,
                text: "Pending Approval",
            },
            approved: {
                variant: "success",
                icon: <BiCheckCircle />,
                text: "Approved",
            },
            rejected: {
                variant: "danger",
                icon: <BiXCircle />,
                text: "Rejected",
            },
            suspended: {
                variant: "secondary",
                icon: <BiXCircle />,
                text: "Suspended",
            },
            active: {
                variant: "success",
                icon: <BiCheckCircle />,
                text: "Active",
            },
            inactive: {
                variant: "secondary",
                icon: <BiXCircle />,
                text: "Inactive",
            },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Badge
                bg={config.variant}
                className="d-inline-flex align-items-center gap-1"
            >
                {config.icon}
                <span className="ms-1">{config.text}</span>
            </Badge>
        );
    };

    // Cases table columns configuration
    const casesColumns = useMemo(
        () => [
            {
                title: "Case ID",
                data: "case_number",
                name: "case_number",
            },
            {
                title: "Type",
                data: "incident_type",
                name: "incident_type",
            },
            {
                title: "Status",
                data: "status",
                name: "status",
                render: (data, type) => {
                    if (type === "display") {
                        const statusConfig = {
                            active: "success",
                            pending: "warning",
                            closed: "secondary",
                            open: "info",
                            resolved: "success",
                        };
                        return `<span class="badge bg-${statusConfig[data] || "secondary"}">${data}</span>`;
                    }
                    return data;
                },
            },
            {
                title: "Primary Officer",
                data: "primary_officer",
                name: "primary_officer.name",
                render: (data, type) => {
                    if (type === "display") {
                        return data?.name || "Unassigned";
                    }
                    return data;
                },
            },
            {
                title: "Created Date",
                data: "created_at",
                name: "created_at",
                type: "date",
            },
            {
                title: "Actions",
                data: "id",
                name: "actions",
                orderable: false,
                searchable: false,
                render: (data, type, row) => {
                    if (type === "display") {
                        return `<button 
                        class="btn btn-warning btn-sm action-btn" 
                        data-action="view-case" 
                        data-id="${data}"
                        data-data='${JSON.stringify(row)}'>
                        <i class="bi bi-eye"></i>
                        View
                    </button>`;
                    }
                    return data;
                },
            },
        ],
        [],
    );

    // Users table columns configuration
    const usersColumns = useMemo(
        () => [
            {
                title: "User",
                data: "name",
                name: "name",
                render: (data, type, row) => {
                    if (type === "display") {
                        return `
                        <div class="d-flex align-items-center gap-2">
                            <img 
                                src="${row.profile_image_url || "https://i.ibb.co/W4ny1p4M/avatar-2.png"}" 
                                class="rounded-circle" 
                                width="40" 
                                height="40"
                                style="object-fit: cover;"
                            />
                            <div>
                                <strong>${data}</strong><br/>
                                <small class="text-muted">${row.email || ""}</small>
                            </div>
                        </div>
                    `;
                    }
                    return data;
                },
            },
            {
                title: "Status",
                data: "is_active",
                name: "is_active",
                type: "boolean",
            },
            {
                title: "Last Login",
                data: "last_login_at",
                name: "last_login_at",
                type: "date",
            },
            {
                title: "Joined",
                data: "created_at",
                name: "created_at",
                type: "date",
            },
            {
                title: "Actions",
                data: "id",
                name: "actions",
                orderable: false,
                searchable: false,
                render: (data, type, row) => {
                    if (type === "display") {
                        return `
                        <div class="btn-group btn-group-sm gap-2">
                            <button 
                                class="btn btn-outline-primary action-btn" 
                                data-action="view-user" 
                                data-id="${data}"
                                data-data='${JSON.stringify(row)}'>
                                <i class="bi bi-eye"></i>
                                View
                            </button>
                        </div>
                    `;
                    }
                    return data;
                },
            },
        ],
        [],
    );

    // Action handlers for cases table
    const caseActionHandlers = {
        "view-case": (rowId, rawData, button) => {
            window.location.href = route("gbv-cases.show", rowId);
        },
    };

    // Action handlers for users table
    const userActionHandlers = {
        "view-user": (rowId, rawData, button) => {
            window.location.href = route("users.show", rowId);
        },
        "edit-user": (rowId, rawData, button) => {
            window.location.href = route("users.edit", rowId);
        },
    };

    // Handle case action click
    const handleCaseActionClick = (action, rowId, rawData, element) => {
        console.log(`Case action: ${action} on row ${rowId}`);
    };

    // Handle user action click
    const handleUserActionClick = (action, rowId, rawData, element) => {
        console.log(`User action: ${action} on row ${rowId}`);
    };

    // Prepare cases data from the provided partner prop
    const casesData = useMemo(() => {
        return partner.cases || [];
    }, [partner.cases]);

    // Prepare users data from the provided partner prop
    const usersData = useMemo(() => {
        return partner.users || [];
    }, [partner.users]);

    // Refresh tables when data changes
    useEffect(() => {
        if (casesTableRef.current && casesData.length > 0) {
            casesTableRef.current.updateData(casesData);
        }
    }, [casesData]);

    useEffect(() => {
        if (usersTableRef.current && usersData.length > 0) {
            usersTableRef.current.updateData(usersData);
        }
    }, [usersData]);

    // Stat Card Component
    const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
        <Card className="border-0 shadow-sm h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 className="text-muted mb-2">{title}</h6>
                        <h2 className="mb-2">{value}</h2>
                        {subtitle && (
                            <small className="text-muted">{subtitle}</small>
                        )}
                        {trend && (
                            <div className="mt-2">
                                <small
                                    className={`text-${trend > 0 ? "success" : "danger"}`}
                                >
                                    {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                                </small>
                            </div>
                        )}
                    </div>
                    <div className={`bg-${color} bg-opacity-10 p-3 rounded-3`}>
                        {icon}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );

    // Info Row Component
    const InfoRow = ({ label, value, icon }) => (
        <div className="d-flex align-items-center py-2 border-bottom">
            <div className="text-muted me-3" style={{ width: "30px" }}>
                {icon}
            </div>
            <div style={{ width: "140px" }} className="fw-semibold">
                {label}:
            </div>
            <div className="flex-grow-1">{value || "N/A"}</div>
        </div>
    );

    // Location info
    const locationInfo = useMemo(() => {
        const locations = [];
        if (partner.county) locations.push(partner.county.name);
        if (partner.subCounty) locations.push(partner.subCounty.name);
        if (partner.ward) locations.push(partner.ward.name);
        if (partner.village) locations.push(partner.village.name);
        return locations.join(" > ") || "Not specified";
    }, [partner]);

    // Services offered
    const servicesOffered = useMemo(() => {
        if (
            !partner.services_offered ||
            !Array.isArray(partner.services_offered)
        ) {
            return [];
        }
        return partner.services_offered;
    }, [partner.services_offered]);

    return (
        <AuthenticatedLayout>
            <Head title={`${partner.organization_name} - Partner Profile`} />

            {/* Page Header */}
            <Row className="mb-4 g-3 align-items-center">
                <Col md={8}>
                    <PageTitle
                        title={partner?.organization_name}
                        icon="🏢"
                        description={partner?.type?.name}
                    />
                    <div>
                        {getStatusBadge(partner.status)}
                        {partner.verified_at && (
                            <Badge
                                bg="info"
                                className="d-inline-flex align-items-center gap-1 ms-2"
                            >
                                <MdVerified />
                                <span className="ms-1">Verified</span>
                            </Badge>
                        )}
                        <Badge
                            bg="light"
                            text="dark"
                            className="d-inline-flex align-items-center gap-1 ms-2"
                        >
                            <BiCalendar className="me-1" />
                            Joined {formatDate(partner.created_at)}
                        </Badge>
                    </div>
                </Col>

                <Col md={4} className="text-md-end">
                    <ButtonGroup className="mb-2 gap-2 mb-md-0">
                        <Button
                            variant="secondary"
                            as={Link}
                            href={route("partners.index")}
                        >
                            <BiArrowToLeft />
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            as={Link}
                            href={route("partners.edit", partner.id)}
                        >
                            <BiEditAlt />
                            Edit
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr mb-3" />

            {/* Main Content Tabs */}
            <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
                className="mb-3"
            >
                <Tab
                    eventKey="overview"
                    title="Overview"
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <Row>
                        <Col lg={7}>
                            <h5 className="mb-3">Organization Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Organization Name"
                                    value={partner.organization_name}
                                    icon={<BiBuilding size={18} />}
                                />
                                <InfoRow
                                    label="Organization Type"
                                    value={partner.type?.name}
                                    icon={<GiOrganigram size={18} />}
                                />
                                <InfoRow
                                    label="Registration Number"
                                    value={partner.registration_number}
                                    icon={<FaRegHandshake size={18} />}
                                />
                                <InfoRow
                                    label="Year Established"
                                    value={partner.year_established}
                                    icon={<BiCalendar size={18} />}
                                />
                                <InfoRow
                                    label="Website"
                                    value={
                                        partner.website ? (
                                            <a
                                                href={partner.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {partner.website}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )
                                    }
                                    icon={<BiGlobe size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Contact Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Contact Person"
                                    value={partner.contact_person}
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Email"
                                    value={
                                        partner.email ? (
                                            <a href={`mailto:${partner.email}`}>
                                                {partner.email}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )
                                    }
                                    icon={<BiMailSend size={18} />}
                                />
                                <InfoRow
                                    label="Phone"
                                    value={
                                        partner.phone ? (
                                            <a href={`tel:${partner.phone}`}>
                                                {partner.phone}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )
                                    }
                                    icon={<BiPhone size={18} />}
                                />
                                <InfoRow
                                    label="Alternate Phone"
                                    value={
                                        partner.alternate_phone ? (
                                            <a
                                                href={`tel:${partner.alternate_phone}`}
                                            >
                                                {partner.alternate_phone}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )
                                    }
                                    icon={<BiPhone size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Description</h5>
                            <div className="bg-light rounded-3 p-3">
                                <p className="mb-0">
                                    {partner.description ||
                                        "No description provided."}
                                </p>
                            </div>
                        </Col>

                        <Col lg={5}>
                            <h5 className="mb-3">Location</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Address"
                                    value={partner.address}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="City"
                                    value={partner.city}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Postal Code"
                                    value={partner.postal_code}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Location"
                                    value={locationInfo}
                                    icon={<BiMap size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Services Offered</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                {servicesOffered.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {servicesOffered.map(
                                            (service, index) => (
                                                <Badge
                                                    key={index}
                                                    bg="primary"
                                                    className="px-3 py-2"
                                                >
                                                    {typeof service === "string"
                                                        ? service
                                                        : service.name ||
                                                          service}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted mb-0">
                                        No services specified
                                    </p>
                                )}
                            </div>

                            <h5 className="mb-3">Compliance & Consent</h5>
                            <div className="bg-light rounded-3 p-3">
                                <InfoRow
                                    label="Terms Accepted"
                                    value={
                                        partner.terms_accepted ? (
                                            <Badge bg="success">Yes</Badge>
                                        ) : (
                                            <Badge bg="danger">No</Badge>
                                        )
                                    }
                                    icon={<BiCheckCircle size={18} />}
                                />
                                <InfoRow
                                    label="Data Sharing Consent"
                                    value={
                                        partner.data_sharing_consent ? (
                                            <Badge bg="success">Granted</Badge>
                                        ) : (
                                            <Badge bg="danger">
                                                Not Granted
                                            </Badge>
                                        )
                                    }
                                    icon={<BiCheckCircle size={18} />}
                                />
                                {partner.terms_accepted_at && (
                                    <InfoRow
                                        label="Terms Accepted At"
                                        value={formatDate(
                                            partner.terms_accepted_at,
                                        )}
                                        icon={<BiTime size={18} />}
                                    />
                                )}
                                {partner.verified_at && (
                                    <InfoRow
                                        label="Verified At"
                                        value={formatDate(partner.verified_at)}
                                        icon={<MdVerified size={18} />}
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>
                </Tab>

                <Tab
                    eventKey="cases"
                    title={`Cases (${casesData.length})`}
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Partner Cases</h5>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                    casesTableRef.current?.refreshTable()
                                }
                            >
                                <BiTime className="me-1" />
                                Refresh
                            </Button>
                            <Button
                                as={Link}
                                href={route("gbv-cases.create", {
                                    partner_id: partner.id,
                                })}
                                variant="primary"
                                size="sm"
                            >
                                <BiFolderOpen className="me-2" />
                                New Case
                            </Button>
                        </div>
                    </div>

                    {casesData.length > 0 ? (
                        <DataTableComponent
                            ref={casesTableRef}
                            id="partner-cases-table"
                            data={casesData}
                            columns={casesColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            onActionClick={handleCaseActionClick}
                            actionHandlers={caseActionHandlers}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[4, "desc"]], // Sort by created date descending
                            }}
                            emptyStateText="No cases found for this partner"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiFolderOpen
                                size={48}
                                className="text-muted mb-3"
                            />
                            <p className="text-muted">
                                No cases found for this partner
                            </p>
                            <Button
                                as={Link}
                                href={route("gbv-cases.create", {
                                    partner_id: partner.id,
                                })}
                                variant="primary"
                                size="sm"
                            >
                                <BiFolderOpen className="me-2" />
                                Create First Case
                            </Button>
                        </div>
                    )}
                </Tab>

                <Tab
                    eventKey="users"
                    title={`Users (${usersData.length})`}
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Partner Users</h5>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                    usersTableRef.current?.refreshTable()
                                }
                            >
                                <BiTime className="me-1" />
                                Refresh
                            </Button>
                            <Button
                                as={Link}
                                href={route("users.create", {
                                    partner_id: partner.id,
                                })}
                                variant="primary"
                                size="sm"
                            >
                                <BiUserPlus className="me-2" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    {usersData.length > 0 ? (
                        <DataTableComponent
                            ref={usersTableRef}
                            id="partner-users-table"
                            data={usersData}
                            columns={usersColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            onActionClick={handleUserActionClick}
                            actionHandlers={userActionHandlers}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[4, "desc"]], // Sort by joined date descending
                            }}
                            emptyStateText="No users found for this partner"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiGroup size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                No users found for this partner
                            </p>
                            <Button
                                as={Link}
                                href={route("users.create", {
                                    partner_id: partner.id,
                                })}
                                variant="primary"
                                size="sm"
                            >
                                <BiUserPlus className="me-2" />
                                Add First User
                            </Button>
                        </div>
                    )}
                </Tab>

                <Tab
                    eventKey="analytics"
                    title="Analytics"
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <Row>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h6 className="mb-0">Cases by Status</h6>
                                </Card.Header>
                                <Card.Body>
                                    {partnerStats?.cases_by_status &&
                                    Object.keys(partnerStats.cases_by_status)
                                        .length > 0 ? (
                                        <>
                                            {Object.entries(
                                                partnerStats.cases_by_status,
                                            ).map(([status, count]) => (
                                                <div
                                                    key={status}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-capitalize">
                                                            {status}
                                                        </span>
                                                        <span className="fw-semibold">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={
                                                            (count /
                                                                partnerStats.total_cases) *
                                                            100
                                                        }
                                                        variant={
                                                            status === "active"
                                                                ? "success"
                                                                : status ===
                                                                    "pending"
                                                                  ? "warning"
                                                                  : status ===
                                                                      "closed"
                                                                    ? "secondary"
                                                                    : "info"
                                                        }
                                                        className="rounded-pill"
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-muted text-center">
                                            No data available
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-4">
                                <Card.Header className="bg-white">
                                    <h6 className="mb-0">Cases by Type</h6>
                                </Card.Header>
                                <Card.Body>
                                    {partnerStats?.cases_by_type &&
                                    Object.keys(partnerStats.cases_by_type)
                                        .length > 0 ? (
                                        <>
                                            {Object.entries(
                                                partnerStats.cases_by_type,
                                            ).map(([type, count]) => (
                                                <div
                                                    key={type}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span>{type}</span>
                                                        <span className="fw-semibold">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={
                                                            (count /
                                                                partnerStats.total_cases) *
                                                            100
                                                        }
                                                        variant="info"
                                                        className="rounded-pill"
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-muted text-center">
                                            No data available
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white">
                                    <h6 className="mb-0">Key Metrics</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiTrendingUp
                                                    size={24}
                                                    className="text-primary mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Case Resolution Rate
                                                </div>
                                                <div className="h4 mb-0">
                                                    {partnerStats?.total_cases >
                                                    0
                                                        ? Math.round(
                                                              ((partnerStats
                                                                  .cases_by_status
                                                                  ?.closed ||
                                                                  0) /
                                                                  partnerStats.total_cases) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiUser
                                                    size={24}
                                                    className="text-success mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Users per Case
                                                </div>
                                                <div className="h4 mb-0">
                                                    {partnerStats?.total_cases >
                                                    0
                                                        ? (
                                                              partnerStats.total_users /
                                                              partnerStats.total_cases
                                                          ).toFixed(1)
                                                        : 0}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiCheckCircle
                                                    size={24}
                                                    className="text-info mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Active Ratio
                                                </div>
                                                <div className="h4 mb-0">
                                                    {partnerStats?.total_users >
                                                    0
                                                        ? Math.round(
                                                              (partnerStats.active_users /
                                                                  partnerStats.total_users) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={3} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiTime
                                                    size={24}
                                                    className="text-warning mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Avg. Cases per User
                                                </div>
                                                <div className="h4 mb-0">
                                                    {partnerStats?.total_users >
                                                    0
                                                        ? (
                                                              partnerStats.total_cases /
                                                              partnerStats.total_users
                                                          ).toFixed(1)
                                                        : 0}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </AuthenticatedLayout>
    );
};

export default ShowPartner;
