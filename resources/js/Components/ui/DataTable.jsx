import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from "react";
import { Table as BootstrapTable } from "react-bootstrap";
import { usePage } from "@inertiajs/react";
import PropTypes from "prop-types";

const DataTableComponent = forwardRef(
    (
        {
            id = "dataTable",
            columns = [],
            ajaxUrl,
            data = [],
            ajaxData = {},
            options = {},
            className = "",
            bordered = true,
            striped = true,
            hover = true,
            responsive = true,
            processing = true,
            serverSide = true,
            pagination = true,
            searching = true,
            onActionClick = null,
            actionHandlers = {},
            emptyStateText = "No data available",
            emptyStateConfig = {
                imageMaxWidth: "200px",
                imageClass: "img-fluid mb-4",
                wrapperClass: "text-center py-5",
            },
            language = {
                emptyTable: "No data available in table",
                zeroRecords: "No matching records found",
                loadingRecords: "Loading...",
                processing: "Processing...",
                search: "Search:",
            },
        },
        ref,
    ) => {
        const tableRef = useRef(null);
        const dataTableInstance = useRef(null);
        const [internalAjaxData, setInternalAjaxData] = useState(ajaxData);
        const [isStaticMode, setIsStaticMode] = useState(!ajaxUrl);

        // Get empty state image from backend app_constants
        const { app_constants } = usePage().props;
        const { empty_state_img } = app_constants || {};

        // Generate empty state HTML with image from backend app_constants
        const getEmptyStateHTML = useCallback(() => {
            if (empty_state_img) {
                return `<div class='${emptyStateConfig.wrapperClass}'>
                    <img 
                        src="${empty_state_img}" 
                        alt="Empty State" 
                        class="${emptyStateConfig.imageClass}" 
                        style="max-width: ${emptyStateConfig.imageMaxWidth}" 
                    />
                    <p class="mb-0">${emptyStateText}</p>
                </div>`;
            }
            return emptyStateText;
        }, [empty_state_img, emptyStateText, emptyStateConfig]);

        // Process columns
        const processedColumns = columns.map((col) => {
            const newCol = { ...col };

            if (col.type === "date" && !col.render) {
                newCol.render = (data, type) => {
                    if (type === "display" && data) {
                        return new Date(data).toLocaleDateString();
                    }
                    return data;
                };
            }

            if (col.type === "boolean" && !col.render) {
                newCol.render = (data, type) => {
                    if (type === "display") {
                        return data
                            ? '<span class="badge bg-success">Yes</span>'
                            : '<span class="badge bg-danger">No</span>';
                    }
                    return data;
                };
            }

            return newCol;
        });

        // Merge language with empty state HTML
        const mergedLanguage = useMemo(() => {
            const emptyStateHTML = getEmptyStateHTML();
            return {
                ...language,
                emptyTable: emptyStateHTML,
                zeroRecords: emptyStateHTML,
            };
        }, [language, getEmptyStateHTML]);

        // Bind action handlers to table rows
        const bindActionHandlers = useCallback(() => {
            if (!dataTableInstance.current) return;

            const $table = $(`#${id}`);

            $table
                .off("click", ".action-btn")
                .on("click", ".action-btn", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const $btn = $(e.currentTarget);
                    const action = $btn.data("action");
                    const rowId = $btn.data("id");
                    const rawData = $btn.data("data");

                    if (onActionClick) {
                        onActionClick(action, rowId, rawData, $btn);
                    }

                    if (actionHandlers[action]) {
                        actionHandlers[action](rowId, rawData, $btn);
                    }
                });

            $table
                .off("click", "[data-action]")
                .on("click", "[data-action]", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const $element = $(e.currentTarget);
                    const action = $element.data("action");
                    const rowId = $element.data("id");
                    const rawData = $element.data("data");

                    if (onActionClick) {
                        onActionClick(action, rowId, rawData, $element);
                    }

                    if (actionHandlers[action]) {
                        actionHandlers[action](rowId, rawData, $element);
                    }
                });
        }, [id, onActionClick, actionHandlers]);

        // Draw callback for binding actions after each draw
        const handleDrawCallback = useCallback(() => {
            if (
                options.drawCallback &&
                typeof options.drawCallback === "function"
            ) {
                options.drawCallback(dataTableInstance.current);
            }

            bindActionHandlers();
        }, [options.drawCallback, bindActionHandlers]);

        // Initialize DataTable with static data
        const initializeStaticDataTable = useCallback(() => {
            if (tableRef.current && !dataTableInstance.current) {
                if ($.fn.DataTable.isDataTable(`#${id}`)) {
                    $(`#${id}`).DataTable().destroy();
                }

                const tableOptions = {
                    data: data,
                    columns: processedColumns,
                    processing,
                    serverSide: false,
                    paging: pagination,
                    searching: searching,
                    language: mergedLanguage,
                    drawCallback: handleDrawCallback,
                    ...options,
                };

                dataTableInstance.current = $(tableRef.current).DataTable(
                    tableOptions,
                );

                setTimeout(() => bindActionHandlers(), 100);
            }
        }, [
            id,
            data,
            processedColumns,
            processing,
            pagination,
            searching,
            options,
            mergedLanguage,
            handleDrawCallback,
            bindActionHandlers,
        ]);

        // Initialize DataTable with AJAX
        const initializeAjaxDataTable = useCallback(() => {
            if (tableRef.current && !dataTableInstance.current) {
                if ($.fn.DataTable.isDataTable(`#${id}`)) {
                    $(`#${id}`).DataTable().destroy();
                }

                const tableOptions = {
                    processing,
                    serverSide,
                    paging: pagination,
                    searching: searching,
                    language: mergedLanguage,
                    drawCallback: handleDrawCallback,
                    ajax: {
                        url: ajaxUrl,
                        type: "GET",
                        data: function (d) {
                            return {
                                // DataTables required params
                                draw: d.draw,
                                start: d.start,
                                length: d.length,

                                // Pagination
                                page: Math.ceil(d.start / d.length) + 1,
                                per_page: d.length,

                                // Search
                                search: d.search?.value || null,

                                // Ordering
                                order_by:
                                    d.order && d.order.length > 0
                                        ? processedColumns[d.order[0].column]
                                              ?.name ||
                                          processedColumns[d.order[0].column]
                                              ?.data
                                        : null,
                                order_dir:
                                    d.order && d.order.length > 0
                                        ? d.order[0].dir
                                        : null,

                                // Custom filters from ajaxData prop
                                ...internalAjaxData,
                            };
                        },
                        dataSrc: "data",
                        error: (xhr, error) => {
                            console.error("DataTables error:", error);
                            console.error("Response:", xhr.responseText);
                        },
                    },
                    columns: processedColumns,
                    ...options,
                };

                dataTableInstance.current = $(tableRef.current).DataTable(
                    tableOptions,
                );

                setTimeout(() => bindActionHandlers(), 100);
            }
        }, [
            id,
            ajaxUrl,
            processedColumns,
            internalAjaxData,
            processing,
            serverSide,
            pagination,
            searching,
            options,
            mergedLanguage,
            handleDrawCallback,
            bindActionHandlers,
        ]);

        // Initialize based on mode
        useEffect(() => {
            if (isStaticMode) {
                initializeStaticDataTable();
            } else {
                initializeAjaxDataTable();
            }

            return () => {
                if (dataTableInstance.current) {
                    dataTableInstance.current.destroy();
                    dataTableInstance.current = null;
                }
            };
        }, [initializeStaticDataTable, initializeAjaxDataTable, isStaticMode]);

        // Refresh table
        const refreshTable = useCallback(() => {
            if (dataTableInstance.current) {
                if (!isStaticMode) {
                    dataTableInstance.current.ajax.reload(null, false);
                } else {
                    dataTableInstance.current.clear();
                    dataTableInstance.current.rows.add(data);
                    dataTableInstance.current.draw();
                }

                setTimeout(() => bindActionHandlers(), 100);
            }
        }, [isStaticMode, data, bindActionHandlers]);

        // Update filters (AJAX mode only)
        const updateAjaxData = useCallback((newData) => {
            setInternalAjaxData((prev) => ({
                ...prev,
                ...newData,
            }));
        }, []);

        // Update static data
        const updateData = useCallback(
            (newData) => {
                if (isStaticMode && dataTableInstance.current) {
                    dataTableInstance.current.clear();
                    dataTableInstance.current.rows.add(newData);
                    dataTableInstance.current.draw();
                    setTimeout(() => bindActionHandlers(), 100);
                }
            },
            [isStaticMode, bindActionHandlers],
        );

        // Reload when AJAX filters change
        useEffect(() => {
            if (!isStaticMode) {
                refreshTable();
            }
        }, [internalAjaxData, refreshTable, isStaticMode]);

        // Reload when static data changes
        useEffect(() => {
            if (isStaticMode && dataTableInstance.current) {
                updateData(data);
            }
        }, [data, isStaticMode, updateData]);

        useImperativeHandle(ref, () => ({
            refreshTable,
            updateAjaxData,
            updateData,
            clearFilters: () => setInternalAjaxData({}),
            getInstance: () => dataTableInstance.current,
            bindActions: bindActionHandlers,
        }));

        return (
            <div className="table-responsive">
                <BootstrapTable
                    ref={tableRef}
                    id={id}
                    bordered={bordered}
                    striped={striped}
                    hover={hover}
                    responsive={responsive}
                    className={`w-100 ${className}`}
                >
                    <thead>
                        <tr>
                            {processedColumns.map((col, index) => (
                                <th key={index} className={col.className}>
                                    {col.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody />
                </BootstrapTable>
            </div>
        );
    },
);

DataTableComponent.displayName = "DataTableComponent";

DataTableComponent.propTypes = {
    id: PropTypes.string,
    columns: PropTypes.array.isRequired,
    ajaxUrl: PropTypes.string,
    data: PropTypes.array,
    ajaxData: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
    bordered: PropTypes.bool,
    striped: PropTypes.bool,
    hover: PropTypes.bool,
    responsive: PropTypes.bool,
    processing: PropTypes.bool,
    serverSide: PropTypes.bool,
    pagination: PropTypes.bool,
    searching: PropTypes.bool,
    onActionClick: PropTypes.func,
    actionHandlers: PropTypes.object,
    emptyStateText: PropTypes.string,
    emptyStateConfig: PropTypes.shape({
        imageMaxWidth: PropTypes.string,
        imageClass: PropTypes.string,
        wrapperClass: PropTypes.string,
    }),
    language: PropTypes.object,
};

export default DataTableComponent;
