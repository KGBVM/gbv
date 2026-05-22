// File: /Pages/Partners/Index.jsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Row,
    Col,
    Card,
    Accordion,
    ButtonGroup,
    Dropdown,
} from "react-bootstrap";
import { BiDownload, BiFilter, BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useErrorToast } from "@/hooks/useErrorToast";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import DataTable from "@/Components/ui/DataTable";
import FilterComponent from "@/Components/ui/Filter";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

export default function Index({ stats, organizationTypes }) {
    const { showErrorToast } = useErrorToast();
    const dataTableRef = useRef(null);

    const [filters, setFilters] = useState({
        search: "",
        organization_type: "",
        status: "",
    });

    // Filter configurations
    const filterConfigs = useMemo(
        () => [
            {
                key: "search",
                type: "search",
                placeholder: "Search by organization, contact, email, phone...",
                colSize: 6,
            },
            {
                key: "organization_type",
                type: "select",
                placeholder: "All Types",
                options: [
                    { value: "", label: "All Types" },
                    ...(organizationTypes?.map((type) => ({
                        value: type.id,
                        label: type.name,
                    })) || []),
                ],
                colSize: 3,
            },
            {
                key: "status",
                type: "select",
                placeholder: "All Status",
                options: [
                    { value: "", label: "All Status" },
                    { value: "pending", label: "Pending Approval" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "suspended", label: "Suspended" },
                ],
                colSize: 3,
            },
        ],
        [organizationTypes],
    );

    // Table columns configuration
    const columns = useMemo(
        () => [
            {
                data: "partner_info",
                title: "Partner",
                className: "text-start",
            },
            {
                data: "user_case_stats",
                title: "Users & Cases",
                className: "text-center",
            },
            {
                data: "referrals_stats",
                title: "Referrals",
                className: "text-center",
            },
            {
                data: "status",
                title: "Status",
                className: "text-center",
            },
            {
                data: "date_created",
                title: "Date",
                className: "text-center",
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

    // Refresh table helper
    const refreshTable = useCallback(() => {
        if (dataTableRef.current?.refreshTable) {
            dataTableRef.current.refreshTable();
        }
    }, []);

    // Update filters helper
    const updateFilters = useCallback((newFilters) => {
        if (dataTableRef.current?.updateAjaxData) {
            dataTableRef.current.updateAjaxData(newFilters);
        }
    }, []);

    // Handle filter changes
    const handleFilterChange = useCallback(
        (newFilters) => {
            const cleanedFilters = {
                search: newFilters.search || "",
                organization_type: newFilters.organization_type || "",
                status: newFilters.status || "",
            };
            setFilters(cleanedFilters);
            updateFilters(cleanedFilters);
        },
        [updateFilters],
    );

    // Handle reset filters
    const handleReset = useCallback(() => {
        const emptyFilters = {
            search: "",
            organization_type: "",
            status: "",
        };
        setFilters(emptyFilters);
        updateFilters(emptyFilters);
    }, [updateFilters]);

    // Generic delete confirmation
    const showDeleteConfirmation = useCallback(
        async (title, text, confirmText = "Yes, delete it!") => {
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

    // Show loading indicator
    const showLoading = useCallback((title, text) => {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    }, []);

    // Handle delete
    const handleDelete = useCallback(
        async (id, hasCases) => {
            if (hasCases) {
                await Swal.fire({
                    title: "Cannot Delete",
                    text: "This partner has associated cases and cannot be deleted.",
                    icon: "warning",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                });
                return;
            }

            const confirmed = await showDeleteConfirmation(
                "Delete Partner?",
                "This action cannot be undone. The partner organization will be permanently deleted.",
                "Yes, delete permanently",
            );

            if (!confirmed) return;

            try {
                showLoading("Deleting...", "Please wait...");
                const response = await xios.delete(
                    route("partners.destroy", id),
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

    // Handle approve
    const handleApprove = useCallback(
        async (id) => {
            const confirmed = await showDeleteConfirmation(
                "Approve Partner?",
                "This partner organization will be approved and gain full access to the system.",
                "Yes, approve",
            );

            if (!confirmed) return;

            try {
                showLoading("Approving...", "Please wait...");
                const response = await xios.post(route("partners.approve", id));

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

    // Handle reject
    const handleReject = useCallback(
        async (id) => {
            const { value: reason } = await Swal.fire({
                title: "Reject Partner?",
                text: "Please provide a reason for rejection:",
                icon: "warning",
                input: "textarea",
                inputPlaceholder: "Enter reason for rejection...",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Reject",
                cancelButtonText: "Cancel",
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to provide a reason!";
                    }
                },
            });

            if (!reason) return;

            try {
                showLoading("Rejecting...", "Please wait...");
                const response = await xios.post(route("partners.reject", id), {
                    reason: reason,
                });

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
        [showLoading, showErrorToast, refreshTable],
    );

    // Action handlers
    const actionHandlers = useMemo(
        () => ({
            view: (id) => router.visit(route("partners.show", id)),
            edit: (id) => router.visit(route("partners.edit", id)),
            delete: (id, rowData) => handleDelete(id, rowData?.has_cases),
            approve: (id) => handleApprove(id),
            reject: (id) => handleReject(id),
        }),
        [handleDelete, handleApprove, handleReject],
    );

    // Handle export
    const handleExport = useCallback(
        async (format) => {
            const confirmed = await showDeleteConfirmation(
                `Export as ${format.toUpperCase()}?`,
                `This will export all filtered partner organizations to ${format.toUpperCase()} format.`,
                `Yes, export now`,
            );

            if (!confirmed) return;

            try {
                showLoading(
                    "Preparing Export...",
                    `Generating ${format.toUpperCase()} file.`,
                );

                const response = await xios.get(
                    route(`exports.partners.${format}`),
                    {
                        params: filters,
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
                    `partners_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`,
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

    // Initial data for DataTable
    const initialAjaxData = useMemo(() => filters, [filters]);

    return (
        <AuthenticatedLayout>
            <Head title="Partner Organizations" />

            {/* Page Header */}
            <Row className="mb-4 g-3 align-items-center">
                <Col md={8}>
                    <PageTitle
                        title="Partner Organizations"
                        icon="🤝"
                        description="Manage partner agencies and organizations in the GBV information system, track their performance and referrals."
                    />
                </Col>

                <Col md={4} className="text-md-end">
                    <ButtonGroup className="mb-2 gap-2 mb-md-0">
                        <Dropdown as={ButtonGroup}>
                            <Dropdown.Toggle
                                variant="outline-primary"
                                className="d-flex align-items-center gap-2"
                            >
                                <BiDownload size={18} />
                                Export
                            </Dropdown.Toggle>

                            <Dropdown.Menu align="end">
                                <Dropdown.Item
                                    onClick={() => handleExport("excel")}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <FaFileExcel size={16} />
                                    Export Excel
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => handleExport("pdf")}
                                    className="d-flex align-items-center gap-2"
                                >
                                    <FaFilePdf size={16} />
                                    Export PDF
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </ButtonGroup>
                </Col>
            </Row>

            <hr className="dashed-hr mb-3" />

            {/* Filters Section */}
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

            {/* Partners Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <DataTable
                        ref={dataTableRef}
                        id="partnersTable"
                        ajaxUrl={route("partners.index")}
                        columns={columns}
                        ajaxData={initialAjaxData}
                        actionHandlers={actionHandlers}
                        emptyStateText="No partner organizations found"
                        language={{
                            searchPlaceholder: "Search partners...",
                        }}
                    />
                </Card.Body>
            </Card>
        </AuthenticatedLayout>
    );
}
