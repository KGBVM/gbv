// File: /Pages/Referrals/Index.jsx
import { Head, Link, usePage } from "@inertiajs/react";
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Accordion,
    Container,
    Button,
    ButtonGroup,
    Dropdown,
} from "react-bootstrap";
import { BiDownload, BiFilter, BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useErrorToast } from "@/hooks/useErrorToast";
import { formatDateTime } from "@/Utils/helpers";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import DataTable from "@/Components/ui/DataTable";
import FilterComponent from "@/Components/ui/Filter";
import StatsCard from "@/Components/ui/StatsCard";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

export default function Index({ stats }) {
    const { showErrorToast } = useErrorToast();

    const [filters, setFilters] = useState({
        search: "",
        direction: "all",
        status: "",
        urgency: "",
        order_by: "created_at",
        order_direction: "desc",
    });

    const dataTableRef = useRef(null);

    const filterConfigs = useMemo(
        () => [
            {
                key: "search",
                type: "search",
                placeholder:
                    "Search by referral number, case number, or survivor name...",
                colSize: 3,
            },
            {
                key: "direction",
                type: "select",
                label: "Referral Type",
                placeholder: "All Referrals",
                options: [
                    { value: "all", label: "All Referrals" },
                    { value: "sent", label: "Sent Referrals" },
                    { value: "received", label: "Received Referrals" },
                    { value: "pending_received", label: "Pending (Received)" },
                ],
                colSize: 3,
            },
            {
                key: "status",
                type: "select",
                label: "Status",
                placeholder: "All Status",
                options: [
                    { value: "", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "accepted", label: "Accepted" },
                    { value: "declined", label: "Declined" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                ],
                colSize: 3,
            },
            {
                key: "urgency",
                type: "select",
                label: "Priority",
                placeholder: "All Priority",
                options: [
                    { value: "", label: "All Priority" },
                    { value: "emergency", label: "Emergency" },
                    { value: "urgent", label: "Urgent" },
                    { value: "routine", label: "Routine" },
                    { value: "low", label: "Low" },
                ],
                colSize: 3,
            },
        ],
        [],
    );

    const columns = useMemo(
        () => [
            {
                data: "referral_number",
                title: "Referral #",
                className: "text-start fw-semibold",
            },
            {
                data: "case_number",
                title: "Case #",
                className: "text-start",
            },
            {
                data: "survivor_name",
                title: "Survivor",
                className: "text-start",
            },
            {
                data: "from_organization",
                title: "From Partner",
                className: "text-start",
            },
            {
                data: "to_organization",
                title: "To Partner",
                className: "text-start",
            },
            {
                data: "urgency_badge",
                title: "Priority",
                className: "text-center",
            },
            {
                data: "status_badge",
                title: "Status",
                className: "text-center",
            },
            {
                data: "created_at",
                title: "Created",
                className: "text-center",
                render: (data) => formatDateTime(data),
            },
            {
                data: "actions",
                title: "Actions",
                className: "text-center",
                width: "15%",
                orderable: false,
                searchable: false,
            },
        ],
        [],
    );

    const refreshTable = useCallback(() => {
        dataTableRef.current?.refreshTable?.();
    }, []);

    const updateFilters = useCallback((newFilters) => {
        // Handle the pending_received special case
        let processedFilters = { ...newFilters };
        if (newFilters.direction === "pending_received") {
            processedFilters.direction = "received";
            processedFilters.status = "pending";
        }
        dataTableRef.current?.updateAjaxData?.(processedFilters);
    }, []);

    const showDeleteConfirmation = useCallback(
        async (title, text, confirmText = "Yes, proceed!") => {
            const result = await Swal.fire({
                title,
                text,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: confirmText,
                cancelButtonText: "Cancel",
                reverseButtons: true,
            });
            return result.isConfirmed;
        },
        [],
    );

    const showLoading = useCallback((title, text) => {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    }, []);

    const handleFilterChange = useCallback(
        (newFilters) => {
            let cleanedFilters = {
                search: newFilters.search || "",
                direction: newFilters.direction || "all",
                status: newFilters.status || "",
                urgency: newFilters.urgency || "",
                order_by: newFilters.order_by || "created_at",
                order_direction: newFilters.order_direction || "desc",
            };

            // Handle pending_received special case
            if (cleanedFilters.direction === "pending_received") {
                cleanedFilters.direction = "received";
                cleanedFilters.status = "pending";
            }

            setFilters(cleanedFilters);
            updateFilters(cleanedFilters);
        },
        [updateFilters],
    );

    const handleReset = useCallback(() => {
        const emptyFilters = {
            search: "",
            direction: "all",
            status: "",
            urgency: "",
            order_by: "created_at",
            order_direction: "desc",
        };
        setFilters(emptyFilters);
        updateFilters(emptyFilters);
    }, [updateFilters]);

    const handleView = useCallback((id) => {
        window.location.href = route("referrals.show", id);
    }, []);

    const handleEdit = useCallback((id) => {
        window.location.href = route("referrals.edit", id);
    }, []);

    const handleDelete = useCallback(
        async (id) => {
            const confirmed = await showDeleteConfirmation(
                "Delete Referral?",
                "This will permanently delete the referral. This action cannot be undone.",
            );
            if (!confirmed) return;

            try {
                showLoading("Deleting...", "Please wait...");
                const response = await xios.delete(
                    route("referrals.destroy", id),
                );

                if (response.data.success) {
                    Swal.close();
                    toast.success(response.data.message);
                    refreshTable();
                }
            } catch (error) {
                Swal.close();
                showErrorToast(error);
            }
        },
        [showDeleteConfirmation, showLoading, showErrorToast, refreshTable],
    );

    const handleUpdateStatus = useCallback(
        async (id, newStatus) => {
            let feedback = null;

            // Show decline reason modal if needed
            if (newStatus === "declined") {
                const result = await Swal.fire({
                    title: "Decline Referral",
                    input: "textarea",
                    inputLabel: "Reason for declining",
                    inputPlaceholder: "Please provide a reason...",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    confirmButtonText: "Decline",
                    cancelButtonText: "Cancel",
                    preConfirm: (reason) => {
                        if (!reason) {
                            Swal.showValidationMessage(
                                "Please provide a reason",
                            );
                            return false;
                        }
                        return reason;
                    },
                });

                if (!result.isConfirmed) return;
                feedback = result.value;
            } else {
                const confirmed = await showDeleteConfirmation(
                    `Update Referral Status`,
                    `Do you want to mark this referral as ${newStatus.toUpperCase()}?`,
                    `Yes, mark as ${newStatus}`,
                );
                if (!confirmed) return;
            }

            try {
                showLoading("Updating status...", "Please wait...");

                const response = await xios.post(
                    route("referrals.update-status", id),
                    {
                        status: newStatus,
                        feedback: feedback,
                    },
                );

                if (response.data.success) {
                    Swal.close();
                    toast.success(response.data.message);
                    refreshTable();
                }
            } catch (error) {
                Swal.close();
                showErrorToast(error);
            }
        },
        [showDeleteConfirmation, showLoading, showErrorToast, refreshTable],
    );

    const actionHandlers = useMemo(
        () => ({
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
            updateStatus: handleUpdateStatus,
        }),
        [handleView, handleEdit, handleDelete, handleUpdateStatus],
    );

    const handleExport = useCallback(
        async (format) => {
            const confirmed = await showDeleteConfirmation(
                `Export as ${format.toUpperCase()}?`,
                `This will export all filtered referrals to ${format.toUpperCase()} format.`,
                `Yes, export now`,
            );

            if (!confirmed) return;

            try {
                showLoading(
                    "Preparing Export...",
                    `Generating ${format.toUpperCase()} file.`,
                );

                // Prepare export params (handle pending_received)
                let exportParams = { ...filters };
                if (
                    exportParams.direction === "received" &&
                    exportParams.status === "pending"
                ) {
                    // This is from pending_received filter
                    exportParams.direction = "pending_received";
                }

                const response = await xios.get(
                    route(`exports.referrals.${format}`),
                    {
                        params: exportParams,
                        responseType: "blob",
                    },
                );

                const url = window.URL.createObjectURL(
                    new Blob([response.data]),
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                    "download",
                    `referrals_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`,
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                Swal.close();
                toast.success(
                    `Exported successfully as ${format.toUpperCase()}!`,
                );
            } catch (error) {
                Swal.close();
                showErrorToast(error, "Export failed");
            }
        },
        [filters, showDeleteConfirmation, showLoading, showErrorToast],
    );

    return (
        <AuthenticatedLayout>
            <Head title="Referrals" />

            <Container fluid>
                <Row className="mb-4 g-3 align-items-center">
                    <Col md={8}>
                        <PageTitle
                            title="Referrals Management"
                            icon="🤝"
                            description="Manage client referrals between organizations, track status updates, and coordinate care services."
                        />
                    </Col>
                    <Col md={4} className="text-md-end">
                        <div className="d-flex gap-2 justify-content-md-end">
                            <Dropdown as={ButtonGroup}>
                                <Dropdown.Toggle
                                    as={Button}
                                    variant="outline-primary"
                                >
                                    <BiDownload className="me-2" />
                                    Download
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        onClick={() => handleExport("excel")}
                                    >
                                        <FaFileExcel className="me-2 text-success" />
                                        Excel
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => handleExport("pdf")}
                                    >
                                        <FaFilePdf className="me-2 text-danger" />
                                        PDF
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>

                {/* Stats Cards */}
                <Row className="mb-4 g-3">
                    {stats.map((card) => (
                        <Col key={card.title} lg={3} md={6}>
                            <StatsCard {...card} />
                        </Col>
                    ))}
                </Row>

                <hr className="dashed-hr mb-3" />

                <Accordion className="mb-4" defaultActiveKey="0">
                    <Accordion.Item className="border-0 shadow-sm" eventKey="0">
                        <Accordion.Header>
                            <BiFilter className="me-2" />
                            Filters
                        </Accordion.Header>
                        <Accordion.Body>
                            <FilterComponent
                                filters={filterConfigs}
                                onFilterChange={handleFilterChange}
                                onReset={handleReset}
                                initialValues={filters}
                                className="mb-3"
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <DataTable
                            ref={dataTableRef}
                            id="referralsTable"
                            ajaxUrl={route("referrals.index")}
                            columns={columns}
                            ajaxData={filters}
                            actionHandlers={actionHandlers}
                            emptyStateText="No referrals found"
                            order={[[7, "desc"]]}
                            language={{
                                searchPlaceholder: "Search referrals...",
                            }}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
}
