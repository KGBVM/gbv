import React, { useMemo, useState, useRef, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Button,
    ButtonGroup,
    Badge,
    Tabs,
    Tab,
    ProgressBar,
    ListGroup,
} from "react-bootstrap";
import {
    BiUser,
    BiMap,
    BiPhone,
    BiCalendar,
    BiHeart,
    BiFile,
    BiTime,
    BiCheckCircle,
    BiXCircle,
    BiShield,
    BiTrendingUp,
    BiGroup,
    BiFolderOpen,
    BiUserPlus,
    BiArrowToLeft,
    BiEditAlt,
    BiIdCard,
    BiPhoneCall,
} from "react-icons/bi";
import { FaRegHandshake } from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import DataTableComponent from "@/Components/ui/DataTable";
import axios from "axios";
import Swal from "sweetalert2";

const ShowSurvivor = ({ survivor, caseStats, timeline }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [updatingConsent, setUpdatingConsent] = useState(false);
    const casesTableRef = useRef(null);
    const timelineTableRef = useRef(null);

    // Format date helper
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Consent update handler
    const handleConsentUpdate = () => {
        Swal.fire({
            title: survivor.consent_given
                ? "Withdraw Consent"
                : "Renew Consent",
            text: survivor.consent_given
                ? "Are you sure you want to withdraw consent? This will restrict data sharing."
                : "Renew consent for this survivor?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: survivor.consent_given ? "#d33" : "#3085d6",
            confirmButtonText: survivor.consent_given
                ? "Yes, withdraw"
                : "Yes, renew",
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                setUpdatingConsent(true);
                axios
                    .post(route("survivors.consent", survivor.id), {
                        consent_given: !survivor.consent_given,
                    })
                    .then(() => {
                        Swal.fire(
                            "Success!",
                            survivor.consent_given
                                ? "Consent withdrawn"
                                : "Consent renewed",
                            "success",
                        );
                        window.location.reload();
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error!",
                            "Failed to update consent",
                            "error",
                        );
                    })
                    .finally(() => {
                        setUpdatingConsent(false);
                    });
            }
        });
    };

    // Status badge configuration
    const getConsentBadge = () => {
        if (survivor.consent_given) {
            return (
                <Badge
                    bg="success"
                    className="d-inline-flex align-items-center gap-1"
                >
                    <BiCheckCircle />
                    <span className="ms-1">Consent Given</span>
                </Badge>
            );
        }
        return (
            <Badge
                bg="danger"
                className="d-inline-flex align-items-center gap-1"
            >
                <BiXCircle />
                <span className="ms-1">No Consent</span>
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
                render: (data, type, row) => {
                    if (type === "display") {
                        return <code>#{data || row.id}</code>;
                    }
                    return data || row.id;
                },
            },
            {
                title: "Incident Type",
                data: "incident_type",
                name: "incident_type",
                render: (data, type) => {
                    if (type === "display") {
                        return data?.replace(/_/g, " ") || "N/A";
                    }
                    return data;
                },
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
                            concluded: "success",
                        };
                        return `<span class="badge bg-${statusConfig[data] || "secondary"}">${data?.replace(/_/g, " ") || "N/A"}</span>`;
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
                render: (data, type) => {
                    if (type === "display") {
                        return formatDate(data);
                    }
                    return data;
                },
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
                        class="btn btn-link btn-sm p-0 action-btn" 
                        data-action="view-case" 
                        data-id="${data}"
                        data-data='${JSON.stringify(row)}'>
                        View Details
                    </button>`;
                    }
                    return data;
                },
            },
        ],
        [],
    );

    // Timeline table columns configuration
    const timelineColumns = useMemo(
        () => [
            {
                title: "Event",
                data: "title",
                name: "title",
                render: (data, type, row) => {
                    if (type === "display") {
                        return `
                        <div class="d-flex align-items-center gap-2">
                            <div class="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i class="bi bi-${row.icon || "clock"}" style="font-size: 16px;"></i>
                            </div>
                            <div>
                                <strong>${data}</strong>
                                ${row.link ? `<br/><small><a href="${row.link}" class="text-decoration-none">View Case →</a></small>` : ""}
                            </div>
                        </div>
                    `;
                    }
                    return data;
                },
            },
            {
                title: "Description",
                data: "description",
                name: "description",
                render: (data, type) => {
                    if (type === "display") {
                        return data || "No description";
                    }
                    return data;
                },
            },
            {
                title: "Timestamp",
                data: "timestamp",
                name: "timestamp",
                type: "date",
                render: (data, type) => {
                    if (type === "display") {
                        return formatDateTime(data);
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
            router.visit(route("gbv-cases.show", rowId));
        },
    };

    // Handle case action click
    const handleCaseActionClick = (action, rowId, rawData, element) => {
        console.log(`Case action: ${action} on row ${rowId}`);
    };

    // Handle timeline action click
    const handleTimelineActionClick = (action, rowId, rawData, element) => {
        console.log(`Timeline action: ${action} on row ${rowId}`);
    };

    // Prepare cases data from the provided survivor prop
    const casesData = useMemo(() => {
        return survivor.cases || [];
    }, [survivor.cases]);

    // Prepare timeline data
    const timelineData = useMemo(() => {
        return timeline || [];
    }, [timeline]);

    // Refresh tables when data changes
    useEffect(() => {
        if (casesTableRef.current && casesData.length > 0) {
            casesTableRef.current.updateData(casesData);
        }
    }, [casesData]);

    useEffect(() => {
        if (timelineTableRef.current && timelineData.length > 0) {
            timelineTableRef.current.updateData(timelineData);
        }
    }, [timelineData]);

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
        if (survivor.county) locations.push(survivor.county.name);
        if (survivor.sub_county) locations.push(survivor.sub_county.name);
        if (survivor.ward) locations.push(survivor.ward.name);
        if (survivor.village) locations.push(survivor.village.name);
        return locations.join(" > ") || "Not specified";
    }, [survivor]);

    // Age calculation
    const calculateAge = (dob) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(survivor.dob);

    return (
        <AuthenticatedLayout>
            <Head
                title={`${survivor.anonymous ? "Anonymous Survivor" : survivor.full_name} - Survivor Profile`}
            />

            {/* Page Header */}
            <Row className="mb-4 g-3 align-items-center">
                <Col md={8}>
                    <PageTitle
                        title={
                            survivor.anonymous
                                ? "Anonymous Survivor"
                                : survivor.full_name
                        }
                        icon="👤"
                        description={`Survivor Code: ${survivor.unique_code}`}
                    />
                    <div>
                        {getConsentBadge()}
                        {survivor.is_pwd && (
                            <Badge
                                bg="info"
                                className="d-inline-flex align-items-center gap-1 ms-2"
                            >
                                <BiHeart />
                                <span className="ms-1">PWD</span>
                            </Badge>
                        )}
                        <Badge
                            bg="light"
                            text="dark"
                            className="d-inline-flex align-items-center gap-1 ms-2"
                        >
                            <BiCalendar className="me-1" />
                            Registered {formatDate(survivor.created_at)}
                        </Badge>
                    </div>
                </Col>

                <Col md={4} className="text-md-end">
                    <ButtonGroup className="mb-2 gap-2 mb-md-0">
                        <Button
                            variant="secondary"
                            as={Link}
                            href={route("survivors.index")}
                        >
                            <BiArrowToLeft />
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            as={Link}
                            href={route("survivors.edit", survivor.id)}
                        >
                            <BiEditAlt />
                            Edit
                        </Button>
                        <Button
                            variant="success"
                            as={Link}
                            href={route("gbv-cases.create", {
                                survivor_id: survivor.id,
                            })}
                        >
                            <BiFolderOpen />
                            New Case
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr mb-3" />

            {/* Stats Cards */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <StatCard
                        title="Total Cases"
                        value={caseStats.total || 0}
                        icon={<BiFolderOpen size={24} />}
                        color="info"
                    />
                </Col>
                <Col md={4}>
                    <StatCard
                        title="Active Cases"
                        value={caseStats.active || 0}
                        icon={<BiTime size={24} />}
                        color="warning"
                    />
                </Col>
                <Col md={4}>
                    <StatCard
                        title="Concluded Cases"
                        value={caseStats.concluded || 0}
                        icon={<BiCheckCircle size={24} />}
                        color="success"
                    />
                </Col>
            </Row>

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
                            <h5 className="mb-3">Personal Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Full Name"
                                    value={
                                        survivor.anonymous
                                            ? "Anonymous"
                                            : survivor.full_name
                                    }
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Unique Code"
                                    value={survivor.unique_code}
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Gender"
                                    value={
                                        survivor.gender
                                            ? survivor.gender
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              survivor.gender.slice(1)
                                            : "Not specified"
                                    }
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Date of Birth"
                                    value={formatDate(survivor.dob)}
                                    icon={<BiCalendar size={18} />}
                                />
                                {age && (
                                    <InfoRow
                                        label="Age"
                                        value={`${age} years`}
                                        icon={<BiCalendar size={18} />}
                                    />
                                )}
                                <InfoRow
                                    label="Age Bracket"
                                    value={
                                        survivor.age_bracket || "Not specified"
                                    }
                                    icon={<BiCalendar size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Contact Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Phone Number"
                                    value={
                                        survivor.phone ? (
                                            <a href={`tel:${survivor.phone}`}>
                                                {survivor.phone}
                                            </a>
                                        ) : (
                                            "Not provided"
                                        )
                                    }
                                    icon={<BiPhone size={18} />}
                                />
                                <InfoRow
                                    label="Alternate Phone"
                                    value={
                                        survivor.alternate_phone ? (
                                            <a
                                                href={`tel:${survivor.alternate_phone}`}
                                            >
                                                {survivor.alternate_phone}
                                            </a>
                                        ) : (
                                            "Not provided"
                                        )
                                    }
                                    icon={<BiPhone size={18} />}
                                />
                            </div>

                            {/* Emergency Contact */}
                            {survivor.emergency_contact_name && (
                                <>
                                    <h5 className="mb-3">Emergency Contact</h5>
                                    <div className="bg-light rounded-3 p-3 mb-4">
                                        <InfoRow
                                            label="Name"
                                            value={
                                                survivor.emergency_contact_name
                                            }
                                            icon={<BiUser size={18} />}
                                        />
                                        <InfoRow
                                            label="Phone"
                                            value={
                                                survivor.emergency_contact_phone ? (
                                                    <a
                                                        href={`tel:${survivor.emergency_contact_phone}`}
                                                    >
                                                        {
                                                            survivor.emergency_contact_phone
                                                        }
                                                    </a>
                                                ) : (
                                                    "Not provided"
                                                )
                                            }
                                            icon={<BiPhoneCall size={18} />}
                                        />
                                        <InfoRow
                                            label="Relationship"
                                            value={
                                                survivor.emergency_contact_relation ||
                                                "Not specified"
                                            }
                                            icon={<BiUser size={18} />}
                                        />
                                    </div>
                                </>
                            )}
                        </Col>

                        <Col lg={5}>
                            <h5 className="mb-3">Location Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="County"
                                    value={survivor.county?.name}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Sub County"
                                    value={survivor.sub_county?.name}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Ward"
                                    value={survivor.ward?.name}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Village"
                                    value={survivor.village?.name}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Landmark"
                                    value={survivor.landmark}
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Full Location"
                                    value={locationInfo}
                                    icon={<BiMap size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Identification</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                {survivor.id_number ? (
                                    <>
                                        <InfoRow
                                            label="ID Type"
                                            value={survivor.id_type?.replace(
                                                /_/g,
                                                " ",
                                            )}
                                            icon={<BiIdCard size={18} />}
                                        />
                                        <InfoRow
                                            label="ID Number"
                                            value={survivor.id_number}
                                            icon={<BiIdCard size={18} />}
                                        />
                                    </>
                                ) : (
                                    <p className="text-muted mb-0 text-center">
                                        No identification provided
                                    </p>
                                )}
                            </div>

                            <h5 className="mb-3">PWD Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                {survivor.is_pwd ? (
                                    <>
                                        <InfoRow
                                            label="Disability Type"
                                            value={survivor.pwd_type}
                                            icon={<BiHeart size={18} />}
                                        />
                                        <InfoRow
                                            label="Registration Number"
                                            value={
                                                survivor.pwd_registration_number ||
                                                "Not provided"
                                            }
                                            icon={<BiHeart size={18} />}
                                        />
                                    </>
                                ) : (
                                    <p className="text-muted mb-0 text-center">
                                        No disability recorded
                                    </p>
                                )}
                            </div>

                            <h5 className="mb-3">Consent Status</h5>
                            <div className="bg-light rounded-3 p-3">
                                <InfoRow
                                    label="Consent Given"
                                    value={
                                        survivor.consent_given ? (
                                            <Badge bg="success">Yes</Badge>
                                        ) : (
                                            <Badge bg="danger">No</Badge>
                                        )
                                    }
                                    icon={<BiShield size={18} />}
                                />
                                {survivor.consent_given_at && (
                                    <InfoRow
                                        label="Consent Given At"
                                        value={formatDateTime(
                                            survivor.consent_given_at,
                                        )}
                                        icon={<BiTime size={18} />}
                                    />
                                )}
                                {survivor.consent_details?.renewed_at && (
                                    <InfoRow
                                        label="Last Renewed"
                                        value={formatDateTime(
                                            survivor.consent_details.renewed_at,
                                        )}
                                        icon={<BiTime size={18} />}
                                    />
                                )}
                                {survivor.consent_details?.withdrawn_at && (
                                    <InfoRow
                                        label="Withdrawn At"
                                        value={formatDateTime(
                                            survivor.consent_details
                                                .withdrawn_at,
                                        )}
                                        icon={<BiTime size={18} />}
                                    />
                                )}
                                <div className="mt-3">
                                    <Button
                                        variant={
                                            survivor.consent_given
                                                ? "danger"
                                                : "success"
                                        }
                                        onClick={handleConsentUpdate}
                                        disabled={updatingConsent}
                                        size="sm"
                                        className="w-100"
                                    >
                                        {survivor.consent_given
                                            ? "Withdraw Consent"
                                            : "Renew Consent"}
                                    </Button>
                                </div>
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
                        <h5>Survivor Cases</h5>
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
                                    survivor_id: survivor.id,
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
                            id="survivor-cases-table"
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
                                order: [[4, "desc"]],
                            }}
                            emptyStateText="No cases found for this survivor"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiFolderOpen
                                size={48}
                                className="text-muted mb-3"
                            />
                            <p className="text-muted">
                                No cases found for this survivor
                            </p>
                            <Button
                                as={Link}
                                href={route("gbv-cases.create", {
                                    survivor_id: survivor.id,
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
                    eventKey="timeline"
                    title="Timeline"
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Activity Timeline</h5>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                                timelineTableRef.current?.refreshTable()
                            }
                        >
                            <BiTime className="me-1" />
                            Refresh
                        </Button>
                    </div>

                    {timelineData.length > 0 ? (
                        <DataTableComponent
                            ref={timelineTableRef}
                            id="survivor-timeline-table"
                            data={timelineData}
                            columns={timelineColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            onActionClick={handleTimelineActionClick}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[2, "desc"]],
                            }}
                            emptyStateText="No timeline events available"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiTime size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                No timeline events available
                            </p>
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
                                    {caseStats?.by_status &&
                                    Object.keys(caseStats.by_status).length >
                                        0 ? (
                                        <>
                                            {Object.entries(
                                                caseStats.by_status,
                                            ).map(([status, count]) => (
                                                <div
                                                    key={status}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-capitalize">
                                                            {status.replace(
                                                                /_/g,
                                                                " ",
                                                            )}
                                                        </span>
                                                        <span className="fw-semibold">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={
                                                            (count /
                                                                (caseStats.total ||
                                                                    1)) *
                                                            100
                                                        }
                                                        variant={
                                                            status ===
                                                                "active" ||
                                                            status === "open"
                                                                ? "success"
                                                                : status ===
                                                                    "pending"
                                                                  ? "warning"
                                                                  : status ===
                                                                          "concluded" ||
                                                                      status ===
                                                                          "resolved"
                                                                    ? "info"
                                                                    : "secondary"
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
                                    {caseStats?.by_type &&
                                    Object.keys(caseStats.by_type).length >
                                        0 ? (
                                        <>
                                            {Object.entries(
                                                caseStats.by_type,
                                            ).map(([type, count]) => (
                                                <div
                                                    key={type}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-capitalize">
                                                            {type.replace(
                                                                /_/g,
                                                                " ",
                                                            )}
                                                        </span>
                                                        <span className="fw-semibold">
                                                            {count}
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        now={
                                                            (count /
                                                                (caseStats.total ||
                                                                    1)) *
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
                                        <Col md={4} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiTrendingUp
                                                    size={24}
                                                    className="text-primary mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Case Resolution Rate
                                                </div>
                                                <div className="h4 mb-0">
                                                    {caseStats.total > 0
                                                        ? Math.round(
                                                              ((caseStats.concluded ||
                                                                  0) /
                                                                  caseStats.total) *
                                                                  100,
                                                          )
                                                        : 0}
                                                    %
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={4} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiCheckCircle
                                                    size={24}
                                                    className="text-success mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Active Cases
                                                </div>
                                                <div className="h4 mb-0">
                                                    {caseStats.active || 0}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={4} sm={6} className="mb-3">
                                            <div className="text-center p-3 bg-light rounded-3">
                                                <BiTime
                                                    size={24}
                                                    className="text-warning mb-2"
                                                />
                                                <div className="fw-bold">
                                                    Total Cases
                                                </div>
                                                <div className="h4 mb-0">
                                                    {caseStats.total || 0}
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

export default ShowSurvivor;
