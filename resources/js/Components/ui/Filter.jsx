// File: /Components/ui/Filter.jsx
import React, { useState, useEffect } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { Search } from "lucide-react";
import PropTypes from "prop-types";
import Select from "react-select";

const FilterComponent = ({
    filters = [],
    onFilterChange,
    onReset,
    initialValues = {},
    className = "",
}) => {
    const [filterValues, setFilterValues] = useState(initialValues);

    // Debounce for search input
    useEffect(() => {
        const searchFilter = filters.find((f) => f.type === "search");
        if (searchFilter) {
            const timer = setTimeout(() => {
                if (onFilterChange) {
                    onFilterChange(filterValues);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [filterValues, filters, onFilterChange]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);

        const isSearchFilter = filters.find(
            (f) => f.key === key && f.type === "search",
        );

        if (!isSearchFilter && onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleReset = () => {
        setFilterValues({});
        if (onReset) onReset();
    };

    const hasActiveFilters = Object.values(filterValues).some(
        (value) => value !== "" && value !== undefined && value !== null,
    );

    // ✅ FIX: Safe comparison (string/number)
    const getSelectedOption = (filterKey, options = []) => {
        const value = filterValues[filterKey];
        if (value === undefined || value === null) return null;

        return (
            options.find((option) => String(option.value) === String(value)) ||
            null
        );
    };

    return (
        <div className={className}>
            {filters.length > 0 && (
                <Row className="g-3 align-items-end">
                    {filters.map((filter, index) => (
                        <Col key={index} md={filter.colSize || 3}>
                            <Form.Group>
                                {filter.label && (
                                    <Form.Label className="mb-2">
                                        {filter.label}
                                    </Form.Label>
                                )}

                                {/* SEARCH */}
                                {filter.type === "search" && (
                                    <InputGroup>
                                        <InputGroup.Text>
                                            <Search size={16} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder={
                                                filter.placeholder ||
                                                "Search..."
                                            }
                                            value={
                                                filterValues[filter.key] || ""
                                            }
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    filter.key,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </InputGroup>
                                )}

                                {/* SELECT */}
                                {filter.type === "select" && (
                                    <Select
                                        options={filter.options || []}
                                        value={getSelectedOption(
                                            filter.key,
                                            filter.options,
                                        )}
                                        onChange={(selectedOption) =>
                                            handleFilterChange(
                                                filter.key,
                                                selectedOption
                                                    ? selectedOption.value
                                                    : null,
                                            )
                                        }
                                        isClearable={
                                            filter.isClearable !== false
                                        }
                                        placeholder={
                                            filter.placeholder || "Select..."
                                        }
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "38px",
                                                borderColor: "#dee2e6",
                                                "&:hover": {
                                                    borderColor: "#86b7fe",
                                                },
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                textTransform: "capitalize",
                                                backgroundColor:
                                                    state.isSelected
                                                        ? "#0d6efd"
                                                        : state.isFocused
                                                          ? "#e7f1ff"
                                                          : "transparent",
                                                color: state.isSelected
                                                    ? "white"
                                                    : "#212529",
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                textTransform: "capitalize",
                                            }),
                                        }}
                                    />
                                )}

                                {/* RADIO */}
                                {filter.type === "radio" && (
                                    <div className="d-flex gap-3 mt-2">
                                        {(filter.options || []).map(
                                            (option) => (
                                                <Form.Check
                                                    key={option.value}
                                                    type="radio"
                                                    label={option.label}
                                                    name={filter.key}
                                                    value={option.value}
                                                    checked={
                                                        String(
                                                            filterValues[
                                                                filter.key
                                                            ],
                                                        ) ===
                                                        String(option.value)
                                                    }
                                                    onChange={(e) =>
                                                        handleFilterChange(
                                                            filter.key,
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                )}

                                {/* DATE */}
                                {filter.type === "date" && (
                                    <Form.Control
                                        type="date"
                                        value={filterValues[filter.key] || ""}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                filter.key,
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}

                                {/* DATE RANGE */}
                                {filter.type === "date-range" && (
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            type="date"
                                            placeholder="From"
                                            value={
                                                filterValues[
                                                    `${filter.key}_from`
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    `${filter.key}_from`,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <Form.Control
                                            type="date"
                                            placeholder="To"
                                            value={
                                                filterValues[
                                                    `${filter.key}_to`
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleFilterChange(
                                                    `${filter.key}_to`,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

FilterComponent.propTypes = {
    filters: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string,
            type: PropTypes.oneOf([
                "search",
                "select",
                "radio",
                "date",
                "date-range",
            ]).isRequired,
            options: PropTypes.arrayOf(
                PropTypes.shape({
                    // ✅ FIX HERE
                    value: PropTypes.oneOfType([
                        PropTypes.string,
                        PropTypes.number,
                    ]).isRequired,
                    label: PropTypes.string.isRequired,
                }),
            ),
            placeholder: PropTypes.string,
            colSize: PropTypes.number,
            isClearable: PropTypes.bool,
        }),
    ),
    onFilterChange: PropTypes.func,
    onReset: PropTypes.func,
    initialValues: PropTypes.object,
    className: PropTypes.string,
};

export default FilterComponent;
