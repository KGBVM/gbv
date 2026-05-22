// File: /Pages/Survivors/Index.jsx

import React, { useState, useRef, useCallback, useMemo } from "react";

import { Head, Link, router } from "@inertiajs/react";

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

import { FaFileExcel, FaFilePdf } from "react-icons/fa";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageTitle from "@/Components/ui/PageTitle";
import FilterComponent from "@/Components/ui/Filter";
import StatsCard from "@/Components/ui/StatsCard";
import DataTableComponent from "@/Components/ui/DataTable";

import { useErrorToast } from "@/hooks/useErrorToast";
import xios from "@/Utils/xios";

const DEFAULT_FILTERS = {
    search: "",
    age_bracket: "",
    gender: "",
    pwd: "",
    order_by: "created_at",
    order_direction: "desc",
};

export default function Index({ stats = [], constants = {} }) {
    const { ageRangeOptions = [], genderOptions = [] } = constants;

    const { showErrorToast } = useErrorToast();

    const dataTableRef = useRef(null);

    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    /**
     * ----------------------------------------------------------------
     * Helpers
     * ----------------------------------------------------------------
     */

    const refreshTable = useCallback(() => {
        dataTableRef.current?.refreshTable?.();
    }, []);

    const updateTableFilters = useCallback((newFilters) => {
        dataTableRef.current?.updateAjaxData?.(newFilters);
    }, []);

    const showConfirmDialog = useCallback(
        async ({ title, text, icon = "warning", confirmText = "Continue" }) => {
            const result = await Swal.fire({
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6c757d",
                reverseButtons: true,
            });

            return result.isConfirmed;
        },
        [],
    );

    const showLoader = useCallback((title, text) => {
        Swal.fire({
            title,
            text,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });
    }, []);

    /**
     * ----------------------------------------------------------------
     * Filters
     * ----------------------------------------------------------------
     */

    const filterConfigs = useMemo(
        () => [
            {
                key: "search",
                type: "search",
                placeholder: "Search by code, name, phone or location...",
                colSize: 3,
            },
            {
                key: "age_bracket",
                type: "select",
                label: "Age Bracket",
                placeholder: "All Ages",
                options: ageRangeOptions,
                colSize: 3,
            },
            {
                key: "gender",
                type: "select",
                label: "Gender",
                placeholder: "All Genders",
                options: genderOptions,
                colSize: 3,
            },
            {
                key: "pwd",
                type: "select",
                label: "PWD Status",
                placeholder: "All",
                options: [
                    {
                        value: "",
                        label: "All",
                    },
                    {
                        value: 1,
                        label: "PWD",
                    },
                    {
                        value: 0,
                        label: "Non-PWD",
                    },
                ],
                colSize: 3,
            },
        ],
        [ageRangeOptions, genderOptions],
    );

    const handleFilterChange = useCallback(
        (newFilters) => {
            const cleanedFilters = {
                ...DEFAULT_FILTERS,
                ...newFilters,
            };

            setFilters(cleanedFilters);
            updateTableFilters(cleanedFilters);
        },
        [updateTableFilters],
    );

    const handleResetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        updateTableFilters(DEFAULT_FILTERS);
    }, [updateTableFilters]);

    /**
     * ----------------------------------------------------------------
     * Actions
     * ----------------------------------------------------------------
     */

    const handleView = useCallback((id) => {
        router.visit(route("survivors.show", id));
    }, []);

    const handleEdit = useCallback((id) => {
        router.visit(route("survivors.edit", id));
    }, []);

    const handleDelete = useCallback(
        async (id, hasActiveCases = false) => {
            if (hasActiveCases) {
                Swal.fire({
                    title: "Cannot Delete",
                    text: "This survivor has active cases.",
                    icon: "warning",
                    confirmButtonText: "OK",
                });

                return;
            }

            const confirmed = await showConfirmDialog({
                title: "Delete Survivor?",
                text: "This action cannot be undone.",
                confirmText: "Yes, Delete",
            });

            if (!confirmed) return;

            try {
                showLoader("Deleting Survivor", "Please wait...");

                await xios.delete(route("survivors.destroy", id));

                Swal.close();

                toast.success("Survivor deleted successfully.");

                refreshTable();
            } catch (error) {
                Swal.close();
                showErrorToast(error);
            }
        },
        [refreshTable, showConfirmDialog, showLoader, showErrorToast],
    );

    const actionHandlers = useMemo(
        () => ({
            view: handleView,
            edit: handleEdit,
            delete: (id, rowData) =>
                handleDelete(id, rowData?.has_active_cases),
        }),
        [handleView, handleEdit, handleDelete],
    );

    /**
     * ----------------------------------------------------------------
     * Export
     * ----------------------------------------------------------------
     */

    const handleExport = useCallback(
        async (format) => {
            const confirmed = await showConfirmDialog({
                title: `Export ${format.toUpperCase()}?`,
                text: "Export filtered survivor records.",
                confirmText: "Export",
            });

            if (!confirmed) return;

            try {
                showLoader("Preparing Export", "Generating file...");

                const response = await xios.get(
                    route(`exports.survivors.${format}`),
                    {
                        params: filters,
                        responseType: "blob",
                    },
                );

                const extension = format === "excel" ? "xlsx" : "pdf";

                const fileName = `survivors_${
                    new Date().toISOString().split("T")[0]
                }.${extension}`;

                const blob = new Blob([response.data]);

                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");

                link.href = url;
                link.download = fileName;

                document.body.appendChild(link);

                link.click();

                link.remove();

                window.URL.revokeObjectURL(url);

                Swal.close();

                toast.success(`${format.toUpperCase()} export completed.`);
            } catch (error) {
                Swal.close();
                showErrorToast(error, "Export failed");
            }
        },
        [filters, showConfirmDialog, showLoader, showErrorToast],
    );

    /**
     * ----------------------------------------------------------------
     * Datatable Columns
     * ----------------------------------------------------------------
     */

    const columns = useMemo(
        () => [
            {
                data: "full_name",
                title: "Name",
                className: "text-start",
            },
            {
                data: null,
                title: "Age / Gender",
                className: "text-start",

                render: (data) => `
                    ${data.age || data.age_bracket || "N/A"} /
                    ${data.gender || "N/A"}
                `,
            },
            {
                data: "location",
                title: "Location",
                className: "text-start",
                defaultContent: "N/A",
            },
            {
                data: "is_pwd",
                title: "PWD",
                className: "text-center",
            },
            {
                data: "consent_given",
                title: "Consent",
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

    return (
        <AuthenticatedLayout>
            <Head title="Survivors" />

            <Container fluid>
                {/* Header */}
                <Row className="align-items-center g-3 mb-4">
                    <Col lg={8}>
                        <PageTitle
                            title="Survivors Management"
                            icon="👥"
                            description="Manage survivor records, monitor cases, and track support services."
                        />
                    </Col>

                    <Col lg={4}>
                        <div className="d-flex gap-2 justify-content-lg-end">
                            <Link
                                href={route("survivors.create")}
                                className="btn btn-primary"
                            >
                                <BiPlus className="me-2" />
                                New Survivor
                            </Link>

                            <Dropdown as={ButtonGroup}>
                                <Dropdown.Toggle
                                    as={Button}
                                    variant="outline-primary"
                                >
                                    <BiDownload className="me-2" />
                                    Export
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

                {/* Stats */}
                <Row className="g-3 mb-4">
                    {stats.map((card, index) => (
                        <Col key={card.title || index} xl={3} md={6}>
                            <StatsCard {...card} />
                        </Col>
                    ))}
                </Row>

                {/* Filters */}
                <Accordion className="mb-4" defaultActiveKey="0">
                    <Accordion.Item eventKey="0" className="border-0 shadow-sm">
                        <Accordion.Header>
                            <BiFilter className="me-2" />
                            Filters
                        </Accordion.Header>

                        <Accordion.Body>
                            <FilterComponent
                                filters={filterConfigs}
                                initialValues={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                {/* Table */}
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <DataTableComponent
                            ref={dataTableRef}
                            id="survivorsTable"
                            ajaxUrl={route("survivors.index")}
                            ajaxData={filters}
                            columns={columns}
                            actionHandlers={actionHandlers}
                            emptyStateText="No survivors found"
                            order={[[8, "desc"]]}
                            language={{
                                searchPlaceholder: "Search survivors...",
                            }}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
}
