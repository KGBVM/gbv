// File: /Pages/GBV/Cases/Index.jsx
import { Head, Link, usePage } from "@inertiajs/react";
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
    Row,
    Col,
    Card,
    Accordion,
    Container,
    ButtonGroup,
    Button,
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
import StatsCard from "@/Components/ui/StatsCard";
import xios from "@/Utils/xios";
import Swal from "sweetalert2";

export default function Index({ stats }) {
    const { showErrorToast } = useErrorToast();

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        priority: "",
        order_by: "created_at",
        order_direction: "desc",
    });

    const dataTableRef = useRef(null);

    const filterConfigs = useMemo(
        () => [
            {
                key: "search",
                type: "search",
                placeholder: "Search by case number or survivor name...",
                colSize: 6,
            },
            {
                key: "status",
                type: "select",
                placeholder: "All Status",
                options: [
                    { value: "", label: "All Status" },
                    { value: "reported", label: "Reported" },
                    {
                        value: "under_investigation",
                        label: "Under Investigation",
                    },
                    { value: "concluded", label: "Concluded" },
                    { value: "closed", label: "Closed" },
                ],
                colSize: 3,
            },
            {
                key: "priority",
                type: "select",
                placeholder: "All Priority",
                options: [
                    { value: "", label: "All Priority" },
                    { value: "low", label: "Low" },
                    { value: "normal", label: "Normal" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" },
                ],
                colSize: 3,
            },
        ],
        [],
    );

    const columns = useMemo(
        () => [
            {
                data: "case_number",
                title: "Case Number",
                className: "text-start fw-semibold",
            },
            {
                data: "survivor_name",
                title: "Survivor",
                className: "text-start",
            },
            {
                data: "incident_type",
                title: "Type",
                className: "text-start",
            },
            {
                data: "status",
                title: "Status",
                className: "text-center",
            },
            {
                data: "priority",
                title: "Priority",
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

    const refreshTable = useCallback(() => {
        dataTableRef.current?.refreshTable?.();
    }, []);

    const updateFilters = useCallback((newFilters) => {
        dataTableRef.current?.updateAjaxData?.(newFilters);
    }, []);

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
            const cleanedFilters = {
                search: newFilters.search || "",
                status: newFilters.status || "",
                priority: newFilters.priority || "",
                order_by: newFilters.order_by || "created_at",
                order_direction: newFilters.order_direction || "desc",
            };
            setFilters(cleanedFilters);
            updateFilters(cleanedFilters);
        },
        [updateFilters],
    );

    const handleReset = useCallback(() => {
        const emptyFilters = {
            search: "",
            status: "",
            priority: "",
            order_by: "created_at",
            order_direction: "desc",
        };
        setFilters(emptyFilters);
        updateFilters(emptyFilters);
    }, [updateFilters]);

    const handleView = useCallback((id) => {
        window.location.href = route("gbv-cases.show", id);
    }, []);

    const handleEdit = useCallback((id) => {
        window.location.href = route("gbv-cases.edit", id);
    }, []);

    const handleDelete = useCallback(
        async (id) => {
            const confirmed = await showDeleteConfirmation(
                "Delete Case?",
                "This will permanently delete the case. This action cannot be undone.",
            );
            if (!confirmed) return;

            try {
                showLoading("Deleting...", "Please wait...");
                const response = await xios.delete(
                    route("gbv-cases.destroy", id),
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

    const handleReferral = useCallback((id) => {
        window.location.href = route("referrals.create", { case_id: id });
    }, []);

    const actionHandlers = useMemo(
        () => ({
            view: handleView,
            edit: handleEdit,
            delete: handleDelete,
            referral: handleReferral,
        }),
        [handleView, handleEdit, handleDelete, handleReferral],
    );

    const handleExport = useCallback(
        async (format) => {
            const confirmed = await showDeleteConfirmation(
                `Export as ${format.toUpperCase()}?`,
                `This will export all filtered cases to ${format.toUpperCase()} format.`,
                `Yes, export now`,
            );

            if (!confirmed) return;

            try {
                showLoading(
                    "Preparing Export...",
                    `Generating ${format.toUpperCase()} file.`,
                );

                const response = await xios.get(
                    route(`exports.gbv-cases.${format}`),
                    {
                        params: { ...filters },
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
                    `gbv_cases_${new Date().toISOString().split("T")[0]}.${format === "excel" ? "xlsx" : "pdf"}`,
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
            <Head title="GBV Cases" />

            <Container fluid>
                <Row className="mb-4 g-3 align-items-center">
                    <Col md={8}>
                        <PageTitle
                            title="GBV Cases"
                            icon="🛡️"
                            description="Manage GBV cases, track incidents, and coordinate survivor support services."
                        />
                    </Col>
                    <Col md={4} className="text-md-end">
                        {/* ButtonGroup */}
                        <ButtonGroup className="gap-2">
                            <Button
                                as={Link}
                                href={route("gbv-cases.create")}
                                variant="primary"
                            >
                                <BiPlus className="me-2" />
                                New Case
                            </Button>
                            <Dropdown>
                                <Dropdown.Toggle
                                    as={Button}
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-pill"
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
                        </ButtonGroup>
                    </Col>
                </Row>

                <hr className="dashed-hr mb-3" />

                {/* Stats Cards */}
                <Row className="mb-4 g-3">
                    {stats.map((card) => (
                        <Col key={card.title} lg={3} md={6}>
                            <StatsCard {...card} />
                        </Col>
                    ))}
                </Row>

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
                            id="gbvCasesTable"
                            ajaxUrl={route("gbv-cases.index")}
                            columns={columns}
                            ajaxData={filters}
                            actionHandlers={actionHandlers}
                            emptyStateText="No cases found"
                            order={[[5, "desc"]]}
                            language={{ searchPlaceholder: "Search cases..." }}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
}
