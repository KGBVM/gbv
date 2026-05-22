import React, { useMemo, useState, useRef, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    ButtonGroup,
    Button,
    Badge,
    Tabs,
    Tab,
    Alert,
    Modal,
    Form,
} from "react-bootstrap";
import {
    BiUser,
    BiCalendar,
    BiMap,
    BiFile,
    BiShare,
    BiTime,
    BiDownload,
    BiUpload,
    BiEdit,
    BiCheckCircle,
    BiXCircle,
    BiMessageSquare,
    BiGroup,
    BiShield,
    BiPlus,
} from "react-icons/bi";
import { FaGavel, FaHeartbeat } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import DataTableComponent from "@/Components/ui/DataTable";
import Swal from "sweetalert2";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { formatDate } from "@/Utils/helpers";

const ShowGbvCase = ({
    auth,
    gbvCase,
    timeline,
    partners,
    caseStatusOptions,
    conclusionTypes,
    referralTypes,
    urgencyOptions,
    canEdit = false,
}) => {
    const [activeTab, setActiveTab] = useState("details");
    const [uploading, setUploading] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const filesTableRef = useRef(null);
    const referralsTableRef = useRef(null);
    const notesTableRef = useRef(null);

    const { data, setData, post, put, processing, errors } = useForm({
        status: gbvCase?.status || "",
        conclusion_type: "",
        conclusion_notes: "",
        referral_type: "",
        to_partner_id: "",
        urgency: "normal",
        reason: "",
        notes: "",
    });

    // Status badge configuration
    const getStatusBadge = (status) => {
        const statusConfig = {
            reported: {
                variant: "warning",
                icon: <AlertCircle size={12} />,
                text: "Reported",
            },
            under_investigation: {
                variant: "info",
                icon: <FaGavel size={12} />,
                text: "Under Investigation",
            },
            medical_attention: {
                variant: "primary",
                icon: <FaHeartbeat size={12} />,
                text: "Medical Attention",
            },
            legal_proceedings: {
                variant: "secondary",
                icon: <FaGavel size={12} />,
                text: "Legal Proceedings",
            },
            counselling: {
                variant: "info",
                icon: <BiMessageSquare size={12} />,
                text: "Counselling",
            },
            shelter_provided: {
                variant: "success",
                icon: <BiShield size={12} />,
                text: "Shelter Provided",
            },
            concluded: {
                variant: "success",
                icon: <BiCheckCircle size={12} />,
                text: "Concluded",
            },
            closed: {
                variant: "secondary",
                icon: <BiXCircle size={12} />,
                text: "Closed",
            },
        };
        const config = statusConfig[status] || statusConfig.reported;
        return (
            <Badge
                bg={config.variant}
                className="d-inline-flex align-items-center gap-1"
            >
                {config.icon}
                <span>{config.text}</span>
            </Badge>
        );
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Files table columns configuration
    const filesColumns = useMemo(
        () => [
            {
                title: "File Name",
                data: "original_name",
                name: "original_name",
                render: (data, type, row) => {
                    if (type === "display") {
                        return `
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-file-text fs-4"></i>
                                <div>
                                    <strong>${data}</strong>
                                    <br/>
                                    <small class="text-muted">${row.file_type?.replace(/_/g, " ") || "Document"}</small>
                                </div>
                            </div>
                        `;
                    }
                    return data;
                },
            },
            {
                title: "Size",
                data: "file_size",
                name: "file_size",
                render: (data, type) => {
                    if (type === "display") {
                        return formatFileSize(data);
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
                        const statusColors = {
                            approved: "success",
                            pending: "warning",
                            rejected: "danger",
                        };
                        return `<span class="badge bg-${statusColors[data] || "secondary"}">${data?.replace(/_/g, " ") || "Pending"}</span>`;
                    }
                    return data;
                },
            },
            {
                title: "Uploaded By",
                data: "created_by",
                name: "created_by.name",
                render: (data, type) => {
                    if (type === "display") {
                        return data?.name || "Unknown";
                    }
                    return data;
                },
            },
            {
                title: "Uploaded At",
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
                            <div class="btn-group btn-group-sm">
                                <button 
                                    class="btn btn-outline-primary action-btn" 
                                    data-action="download-file" 
                                    data-id="${data}"
                                    data-data='${JSON.stringify(row)}'>
                                    <i class="bi bi-download"></i>
                                </button>
                                ${
                                    canEdit &&
                                    gbvCase?.status !== "concluded" &&
                                    gbvCase?.status !== "closed"
                                        ? `
                                    <button 
                                        class="btn btn-outline-danger action-btn" 
                                        data-action="delete-file" 
                                        data-id="${data}"
                                        data-data='${JSON.stringify(row)}'>
                                        <i class="bi bi-trash"></i>
                                    </button>
                                `
                                        : ""
                                }
                            </div>
                        `;
                    }
                    return data;
                },
            },
        ],
        [canEdit, gbvCase?.status],
    );

    // Referrals table columns configuration
    const referralsColumns = useMemo(
        () => [
            {
                title: "Referral Type",
                data: "referral_type",
                name: "referral_type",
                render: (data, type) => {
                    if (type === "display") {
                        return `<span class="text-capitalize">${data?.replace(/_/g, " ")}</span>`;
                    }
                    return data;
                },
            },
            {
                title: "Partner",
                data: "to_partner",
                name: "to_partner.organization_name",
                render: (data, type) => {
                    if (type === "display") {
                        return data?.organization_name || "N/A";
                    }
                    return data;
                },
            },
            {
                title: "Urgency",
                data: "urgency",
                name: "urgency",
                render: (data, type) => {
                    if (type === "display") {
                        const urgencyColors = {
                            critical: "danger",
                            high: "warning",
                            normal: "primary",
                            low: "secondary",
                        };
                        return `<span class="badge bg-${urgencyColors[data] || "secondary"} text-uppercase">${data}</span>`;
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
                        const statusColors = {
                            completed: "success",
                            accepted: "info",
                            pending: "warning",
                            declined: "danger",
                        };
                        return `<span class="badge bg-${statusColors[data] || "secondary"}">${data?.replace(/_/g, " ")}</span>`;
                    }
                    return data;
                },
            },
            {
                title: "Created At",
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
                            <button 
                                class="btn btn-sm btn-link action-btn" 
                                data-action="view-referral" 
                                data-id="${data}"
                                data-data='${JSON.stringify(row)}'>
                                View Details
                            </button>
                        `;
                    }
                    return data;
                },
            },
        ],
        [],
    );

    // Notes table columns configuration
    const notesColumns = useMemo(
        () => [
            {
                title: "Note",
                data: "content",
                name: "content",
                render: (data, type) => {
                    if (type === "display") {
                        if (data.length > 100) {
                            return data.substring(0, 100) + "...";
                        }
                        return data;
                    }
                    return data;
                },
            },
            {
                title: "Author",
                data: "author",
                name: "author.name",
                render: (data, type) => {
                    if (type === "display") {
                        return data?.name || "System";
                    }
                    return data;
                },
            },
            {
                title: "Important",
                data: "is_important",
                name: "is_important",
                type: "boolean",
            },
            {
                title: "Created At",
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
                            <button 
                                class="btn btn-sm btn-link action-btn" 
                                data-action="view-note" 
                                data-id="${data}"
                                data-data='${JSON.stringify(row)}'>
                                View Full
                            </button>
                        `;
                    }
                    return data;
                },
            },
        ],
        [],
    );

    // Action handlers
    const fileActionHandlers = {
        "download-file": async (rowId, rawData, button) => {
            try {
                window.open(
                    route("gbv-cases.files.download", [gbvCase.id, rowId]),
                    "_blank",
                );
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to download file",
                });
            }
        },
        "delete-file": async (rowId, rawData, button) => {
            const result = await Swal.fire({
                title: "Delete File?",
                text: "Are you sure you want to delete this file?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
            });

            if (result.isConfirmed) {
                try {
                    await axios.delete(
                        route("gbv-cases.files.destroy", [gbvCase.id, rowId]),
                    );
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "File deleted successfully",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    setTimeout(() => window.location.reload(), 2000);
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error!",
                        text:
                            error.response?.data?.message ||
                            "Failed to delete file",
                    });
                }
            }
        },
    };

    const referralActionHandlers = {
        "view-referral": (rowId, rawData, button) => {
            Swal.fire({
                title: "Referral Details",
                html: `
                    <div class="text-start">
                        <p><strong>Type:</strong> ${rawData.referral_type?.replace(/_/g, " ")}</p>
                        <p><strong>Partner:</strong> ${rawData.to_partner?.organization_name}</p>
                        <p><strong>Urgency:</strong> ${rawData.urgency?.toUpperCase()}</p>
                        <p><strong>Status:</strong> ${rawData.status?.replace(/_/g, " ")}</p>
                        <p><strong>Reason:</strong> ${rawData.reason}</p>
                        ${rawData.notes ? `<p><strong>Notes:</strong> ${rawData.notes}</p>` : ""}
                        ${rawData.feedback ? `<p><strong>Feedback:</strong> ${rawData.feedback}</p>` : ""}
                        <p><strong>Created:</strong> ${formatDate(rawData.created_at)}</p>
                    </div>
                `,
                icon: "info",
                confirmButtonText: "Close",
            });
        },
    };

    const noteActionHandlers = {
        "view-note": (rowId, rawData, button) => {
            Swal.fire({
                title: "Case Note",
                html: `
                    <div class="text-start">
                        <p><strong>Author:</strong> ${rawData.author?.name || "System"}</p>
                        <p><strong>Created:</strong> ${formatDate(rawData.created_at)}</p>
                        <hr/>
                        <p>${rawData.content}</p>
                        ${rawData.is_important ? '<p class="text-danger"><strong>⚠️ Important Note</strong></p>' : ""}
                    </div>
                `,
                icon: rawData.is_important ? "warning" : "info",
                confirmButtonText: "Close",
            });
        },
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        setUploading(true);
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("files[]", files[i]);
        }

        try {
            await axios.post(
                route("gbv-cases.files.store", gbvCase.id),
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Files uploaded successfully",
                timer: 2000,
                showConfirmButton: false,
            });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: error.response?.data?.message || "Failed to upload files",
            });
        } finally {
            setUploading(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        try {
            await axios.put(route("gbv-cases.status", gbvCase.id), {
                status: newStatus,
            });
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Status updated successfully",
                timer: 2000,
                showConfirmButton: false,
            });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text:
                    error.response?.data?.message || "Failed to update status",
            });
        }
    };

    // Handle case conclusion
    const handleConclude = () => {
        setShowStatusModal(true);
    };

    const submitConclusion = (e) => {
        e.preventDefault();

        put(route("gbv-cases.conclude", gbvCase.id), {
            data: {
                conclusion_type: data.conclusion_type,
                conclusion_notes: data.conclusion_notes,
            },
            onSuccess: () => {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Case concluded successfully",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setShowStatusModal(false);
                setTimeout(() => window.location.reload(), 2000);
            },
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to conclude case",
                });
            },
        });
    };

    // Handle create referral
    const handleCreateReferral = (e) => {
        e.preventDefault();

        post(route("referrals.store"), {
            data: {
                case_id: gbvCase.id,
                referral_type: data.referral_type,
                to_partner_id: data.to_partner_id,
                urgency: data.urgency,
                reason: data.reason,
                notes: data.notes,
            },
            onSuccess: () => {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Referral created successfully",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setShowReferralModal(false);
                setData({
                    referral_type: "",
                    to_partner_id: "",
                    urgency: "normal",
                    reason: "",
                    notes: "",
                });
                setTimeout(() => window.location.reload(), 2000);
            },
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Failed to create referral",
                });
            },
        });
    };

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

    // Prepare data for tables
    const filesData = useMemo(() => {
        return gbvCase?.case_files || [];
    }, [gbvCase?.case_files]);

    const referralsData = useMemo(() => {
        return gbvCase?.referrals || [];
    }, [gbvCase?.referrals]);

    const notesData = useMemo(() => {
        return gbvCase?.notes || [];
    }, [gbvCase?.notes]);

    // Refresh tables when data changes
    useEffect(() => {
        if (filesTableRef.current && filesData.length > 0) {
            filesTableRef.current.updateData(filesData);
        }
    }, [filesData]);

    useEffect(() => {
        if (referralsTableRef.current && referralsData.length > 0) {
            referralsTableRef.current.updateData(referralsData);
        }
    }, [referralsData]);

    useEffect(() => {
        if (notesTableRef.current && notesData.length > 0) {
            notesTableRef.current.updateData(notesData);
        }
    }, [notesData]);

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={`Case ${gbvCase?.case_number || "Details"}`} />

            {/* Page Header */}
            <Row className="mb-4 g-3 align-items-center">
                <Col md={8}>
                    <PageTitle
                        title={gbvCase?.case_number}
                        icon="⚖️"
                        description={`GBV Case - ${gbvCase?.incident_type?.replace(/_/g, " ")}`}
                    />
                    <div>
                        {getStatusBadge(gbvCase?.status)}
                        <Badge
                            bg="light"
                            text="dark"
                            className="d-inline-flex align-items-center gap-1 ms-2"
                        >
                            <BiCalendar className="me-1" />
                            Created {formatDate(gbvCase?.created_at)}
                        </Badge>
                    </div>
                </Col>

                <Col md={4} className="text-md-end">
                    <ButtonGroup className="mb-2 gap-2 mb-md-0">
                        {canEdit &&
                            gbvCase?.status !== "concluded" &&
                            gbvCase?.status !== "closed" && (
                                <>
                                    <Button
                                        variant="success"
                                        onClick={handleConclude}
                                    >
                                        <BiCheckCircle className="me-1" />
                                        Conclude
                                    </Button>
                                    <Button
                                        variant="primary"
                                        as={Link}
                                        href={route(
                                            "gbv-cases.edit",
                                            gbvCase?.id,
                                        )}
                                    >
                                        <BiEdit className="me-1" />
                                        Edit
                                    </Button>
                                </>
                            )}
                        <Button
                            variant="outline-primary"
                            as="a"
                            href={route("gbv-cases.download-pdf", gbvCase?.id)}
                            target="_blank"
                        >
                            <BiDownload className="me-1" />
                            PDF
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
                    eventKey="details"
                    title="Details"
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <Row>
                        <Col lg={7}>
                            <h5 className="mb-3">Incident Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Incident Type"
                                    value={
                                        <>
                                            {gbvCase?.incident_type?.replace(
                                                /_/g,
                                                " ",
                                            )}
                                            {gbvCase?.incident_type ===
                                                "other" &&
                                                gbvCase?.incident_type_other &&
                                                ` - ${gbvCase.incident_type_other}`}
                                        </>
                                    }
                                    icon={<AlertCircle size={18} />}
                                />
                                <InfoRow
                                    label="Incident Date & Time"
                                    value={`${formatDate(gbvCase?.incident_date)}${gbvCase?.incident_time ? ` at ${gbvCase.incident_time}` : ""}`}
                                    icon={<BiCalendar size={18} />}
                                />
                                <InfoRow
                                    label="Location"
                                    value={
                                        <>
                                            {gbvCase?.incident_location ||
                                                "Not specified"}
                                            {gbvCase?.county &&
                                                `, ${gbvCase.county.name}`}
                                            {gbvCase?.subCounty &&
                                                `, ${gbvCase.subCounty.name}`}
                                            {gbvCase?.ward &&
                                                `, ${gbvCase.ward.name}`}
                                        </>
                                    }
                                    icon={<BiMap size={18} />}
                                />
                                <InfoRow
                                    label="Police Involvement"
                                    value={
                                        gbvCase?.reported_to_police ? (
                                            <>
                                                Yes
                                                {gbvCase?.police_station &&
                                                    ` (${gbvCase.police_station})`}
                                                {gbvCase?.ob_number &&
                                                    ` - OB: ${gbvCase.ob_number}`}
                                            </>
                                        ) : (
                                            "No"
                                        )
                                    }
                                    icon={<FaGavel size={18} />}
                                />
                                <InfoRow
                                    label="Medical Attention"
                                    value={
                                        gbvCase?.medical_attention ? (
                                            <>
                                                Yes
                                                {gbvCase?.health_facility &&
                                                    ` at ${gbvCase.health_facility}`}
                                            </>
                                        ) : (
                                            "No"
                                        )
                                    }
                                    icon={<FaHeartbeat size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Incident Description</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <p className="mb-0">
                                    {gbvCase?.description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <h5 className="mb-3">Case Management</h5>
                            <div className="bg-light rounded-3 p-3">
                                <InfoRow
                                    label="Primary Officer"
                                    value={
                                        gbvCase?.primary_officer?.name ||
                                        "Unassigned"
                                    }
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Created By"
                                    value={gbvCase?.creator?.name}
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Confidentiality Level"
                                    value={
                                        gbvCase?.confidentiality_level?.toUpperCase() ||
                                        "Standard"
                                    }
                                    icon={<BiShield size={18} />}
                                />
                                {gbvCase?.concluded_at && (
                                    <>
                                        <InfoRow
                                            label="Concluded At"
                                            value={formatDate(
                                                gbvCase.concluded_at,
                                            )}
                                            icon={<BiCalendar size={18} />}
                                        />
                                        <InfoRow
                                            label="Conclusion Type"
                                            value={gbvCase?.conclusion_type?.replace(
                                                /_/g,
                                                " ",
                                            )}
                                            icon={<BiCheckCircle size={18} />}
                                        />
                                    </>
                                )}
                            </div>
                        </Col>

                        <Col lg={5}>
                            <h5 className="mb-3">Survivor Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                <InfoRow
                                    label="Name"
                                    value={
                                        gbvCase?.survivor?.anonymous_name ||
                                        gbvCase?.survivor?.full_name ||
                                        "Anonymous"
                                    }
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="Age Bracket"
                                    value={
                                        gbvCase?.survivor?.age_bracket ||
                                        "Not specified"
                                    }
                                    icon={<BiCalendar size={18} />}
                                />
                                <InfoRow
                                    label="Gender"
                                    value={
                                        gbvCase?.survivor?.gender?.toUpperCase() ||
                                        "Not specified"
                                    }
                                    icon={<BiUser size={18} />}
                                />
                                <InfoRow
                                    label="PWD Status"
                                    value={
                                        gbvCase?.survivor?.is_pwd
                                            ? "Person with Disability"
                                            : "No"
                                    }
                                    icon={<MdVerified size={18} />}
                                />
                                <InfoRow
                                    label="Phone"
                                    value={
                                        gbvCase?.survivor?.phone ||
                                        "Not provided"
                                    }
                                    icon={<BiUser size={18} />}
                                />
                            </div>

                            <h5 className="mb-3">Perpetrator Information</h5>
                            <div className="bg-light rounded-3 p-3 mb-4">
                                {gbvCase?.perpetrators?.length > 0 ? (
                                    gbvCase.perpetrators.map((perp, index) => (
                                        <div
                                            key={index}
                                            className="mb-3 pb-2 border-bottom"
                                        >
                                            <h6 className="fw-semibold mb-2">
                                                Perpetrator {index + 1}
                                            </h6>
                                            <InfoRow
                                                label="Age Range"
                                                value={
                                                    perp.age_range || "Unknown"
                                                }
                                                icon={<BiUser size={14} />}
                                            />
                                            <InfoRow
                                                label="Gender"
                                                value={
                                                    perp.gender?.toUpperCase() ||
                                                    "Unknown"
                                                }
                                                icon={<BiUser size={14} />}
                                            />
                                            <InfoRow
                                                label="Relationship"
                                                value={
                                                    perp.relationship?.replace(
                                                        /_/g,
                                                        " ",
                                                    ) || "Unknown"
                                                }
                                                icon={<BiGroup size={14} />}
                                            />
                                            {perp.name_known && perp.name && (
                                                <InfoRow
                                                    label="Name"
                                                    value={perp.name}
                                                    icon={<BiUser size={14} />}
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted mb-0">
                                        No perpetrator information provided
                                    </p>
                                )}
                            </div>

                            {/* Status Update Section */}
                            {canEdit &&
                                gbvCase?.status !== "concluded" &&
                                gbvCase?.status !== "closed" && (
                                    <Card className="border-0 shadow-sm">
                                        <Card.Header className="bg-white">
                                            <h6 className="mb-0">
                                                Update Case Status
                                            </h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="d-flex flex-wrap gap-2">
                                                {Object.entries(
                                                    caseStatusOptions,
                                                )
                                                    .filter(
                                                        ([value, option]) =>
                                                            value !==
                                                            gbvCase?.status,
                                                    )
                                                    .map(([value, option]) => (
                                                        <Button
                                                            key={value}
                                                            variant={`outline-${option.color}`}
                                                            size="sm"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    value,
                                                                )
                                                            }
                                                            className="rounded-pill px-3"
                                                        >
                                                            <span className="me-1">
                                                                {option.icon}
                                                            </span>
                                                            {option.label}
                                                        </Button>
                                                    ))}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                        </Col>
                    </Row>
                </Tab>

                <Tab
                    eventKey="files"
                    title={`Files (${filesData.length})`}
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Case Files</h5>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                    filesTableRef.current?.refreshTable()
                                }
                            >
                                <BiTime className="me-1" />
                                Refresh
                            </Button>
                            {canEdit &&
                                gbvCase?.status !== "concluded" &&
                                gbvCase?.status !== "closed" && (
                                    <>
                                        <Form.Control
                                            type="file"
                                            id="file-upload"
                                            multiple
                                            className="d-none"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "file-upload",
                                                    )
                                                    ?.click()
                                            }
                                            disabled={uploading}
                                        >
                                            <BiUpload className="me-2" />
                                            {uploading
                                                ? "Uploading..."
                                                : "Upload Files"}
                                        </Button>
                                    </>
                                )}
                        </div>
                    </div>

                    {filesData.length > 0 ? (
                        <DataTableComponent
                            ref={filesTableRef}
                            id="case-files-table"
                            data={filesData}
                            columns={filesColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            actionHandlers={fileActionHandlers}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[4, "desc"]],
                            }}
                            emptyStateText="No files uploaded for this case"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiFile size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                No files have been uploaded for this case yet
                            </p>
                            {canEdit &&
                                gbvCase?.status !== "concluded" &&
                                gbvCase?.status !== "closed" && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            document
                                                .getElementById("file-upload")
                                                ?.click()
                                        }
                                    >
                                        <BiUpload className="me-2" />
                                        Upload First File
                                    </Button>
                                )}
                        </div>
                    )}
                </Tab>

                <Tab
                    eventKey="referrals"
                    title={`Referrals (${referralsData.length})`}
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Referrals</h5>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                    referralsTableRef.current?.refreshTable()
                                }
                            >
                                <BiTime className="me-1" />
                                Refresh
                            </Button>
                            {canEdit &&
                                gbvCase?.status !== "concluded" &&
                                gbvCase?.status !== "closed" && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            setShowReferralModal(true)
                                        }
                                    >
                                        <BiPlus className="me-2" />
                                        New Referral
                                    </Button>
                                )}
                        </div>
                    </div>

                    {referralsData.length > 0 ? (
                        <DataTableComponent
                            ref={referralsTableRef}
                            id="case-referrals-table"
                            data={referralsData}
                            columns={referralsColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            actionHandlers={referralActionHandlers}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[4, "desc"]],
                            }}
                            emptyStateText="No referrals have been made for this case"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiShare size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                No referrals have been made for this case yet
                            </p>
                            {canEdit &&
                                gbvCase?.status !== "concluded" &&
                                gbvCase?.status !== "closed" && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            setShowReferralModal(true)
                                        }
                                    >
                                        <BiPlus className="me-2" />
                                        Create First Referral
                                    </Button>
                                )}
                        </div>
                    )}
                </Tab>

                <Tab
                    eventKey="timeline"
                    title="Timeline"
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <h5 className="mb-4">Case Timeline</h5>
                    {timeline?.length > 0 ? (
                        <div className="position-relative">
                            {timeline.map((event, eventIdx) => (
                                <div key={eventIdx} className="d-flex mb-4">
                                    <div className="me-3">
                                        <div
                                            className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                            }}
                                        >
                                            <span className="text-white small fw-bold">
                                                {eventIdx + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                                            <div>
                                                <h6 className="fw-semibold mb-1">
                                                    {event.title}
                                                </h6>
                                                <p className="text-muted small mb-0">
                                                    {event.description}
                                                </p>
                                                {event.user && (
                                                    <small className="text-muted">
                                                        by {event.user}
                                                    </small>
                                                )}
                                            </div>
                                            <small className="text-muted">
                                                {formatDate(event.timestamp)}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <BiTime size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                No timeline events recorded for this case
                            </p>
                        </div>
                    )}
                </Tab>

                <Tab
                    eventKey="notes"
                    title={`Notes (${notesData.length})`}
                    className="bg-white shadow-sm rounded-4 p-3"
                >
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <h5>Case Notes</h5>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                                notesTableRef.current?.refreshTable()
                            }
                        >
                            <BiTime className="me-1" />
                            Refresh
                        </Button>
                    </div>

                    {notesData.length > 0 ? (
                        <DataTableComponent
                            ref={notesTableRef}
                            id="case-notes-table"
                            data={notesData}
                            columns={notesColumns}
                            serverSide={false}
                            pagination={true}
                            searching={true}
                            processing={true}
                            actionHandlers={noteActionHandlers}
                            options={{
                                pageLength: 10,
                                lengthMenu: [
                                    [10, 25, 50, -1],
                                    [10, 25, 50, "All"],
                                ],
                                order: [[3, "desc"]],
                            }}
                            emptyStateText="No notes have been added to this case"
                        />
                    ) : (
                        <div className="text-center py-5">
                            <BiMessageSquare
                                size={48}
                                className="text-muted mb-3"
                            />
                            <p className="text-muted">
                                No notes have been added to this case yet
                            </p>
                        </div>
                    )}
                </Tab>
            </Tabs>

            {/* Conclude Case Modal */}
            <Modal
                show={showStatusModal}
                onHide={() => setShowStatusModal(false)}
                centered
            >
                <Form onSubmit={submitConclusion}>
                    <Modal.Header closeButton>
                        <Modal.Title>Conclude Case</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                Conclusion Type{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                                value={data.conclusion_type}
                                onChange={(e) =>
                                    setData("conclusion_type", e.target.value)
                                }
                                isInvalid={!!errors.conclusion_type}
                                required
                            >
                                <option value="">
                                    Select conclusion type...
                                </option>
                                {conclusionTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors.conclusion_type}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">
                                Conclusion Notes{" "}
                                <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={data.conclusion_notes}
                                onChange={(e) =>
                                    setData("conclusion_notes", e.target.value)
                                }
                                isInvalid={!!errors.conclusion_notes}
                                placeholder="Provide detailed notes about the case conclusion..."
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.conclusion_notes}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowStatusModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={processing}
                        >
                            {processing ? "Concluding..." : "Conclude Case"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Create Referral Modal */}
            <Modal
                show={showReferralModal}
                onHide={() => setShowReferralModal(false)}
                centered
                size="lg"
            >
                <Form onSubmit={handleCreateReferral}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Referral</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Referral Type{" "}
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={data.referral_type}
                                        onChange={(e) =>
                                            setData(
                                                "referral_type",
                                                e.target.value,
                                            )
                                        }
                                        isInvalid={!!errors.referral_type}
                                        required
                                    >
                                        <option value="">Select type...</option>
                                        {referralTypes.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.icon}
                                                {type.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Partner Organization{" "}
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={data.to_partner_id}
                                        onChange={(e) =>
                                            setData(
                                                "to_partner_id",
                                                e.target.value,
                                            )
                                        }
                                        isInvalid={!!errors.to_partner_id}
                                        required
                                    >
                                        <option value="">
                                            Select partner...
                                        </option>
                                        {partners?.map((partner) => (
                                            <option
                                                key={partner.id}
                                                value={partner.id}
                                            >
                                                {partner.organization_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Urgency{" "}
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={data.urgency}
                                        onChange={(e) =>
                                            setData("urgency", e.target.value)
                                        }
                                        required
                                    >
                                        {urgencyOptions.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Reason for Referral{" "}
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={data.reason}
                                        onChange={(e) =>
                                            setData("reason", e.target.value)
                                        }
                                        isInvalid={!!errors.reason}
                                        placeholder="Explain why this referral is needed..."
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">
                                        Additional Notes
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="Any additional information for the partner..."
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Alert variant="info" className="mt-3">
                            <AlertCircle size={16} className="me-2" />
                            Referrals will be sent to the partner organization
                            for review and action.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowReferralModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={processing}
                        >
                            {processing ? "Creating..." : "Create Referral"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </AuthenticatedLayout>
    );
};

export default ShowGbvCase;
