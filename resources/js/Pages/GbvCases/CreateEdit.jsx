import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Select from "react-select";
import useData from "@/hooks/useData";
import PageTitle from "@/Components/ui/PageTitle";
import {
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
    Tooltip,
    OverlayTrigger,
} from "react-bootstrap";
import {
    AlertCircle,
    Plus,
    Trash2,
    Save,
    X,
    Info,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Phone,
    Shield,
    User,
    Clock,
    FileText,
    AlertTriangle,
    Heart,
    Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { BiXCircle } from "react-icons/bi";
import { useErrorToast } from "@/hooks/useErrorToast";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";

export default function CreateEdit({
    auth,
    constants,
    survivors,
    officers,
    gbvCase = null,
}) {
    const {
        incidentTypes,
        priorityLevels,
        confidentialityLevels,
        ageRangeOptions,
        genderOptions,
        relationshipOptions,
    } = constants;

    const [activeTab, setActiveTab] = useState("survivor");
    const { showErrorToast } = useErrorToast();
    const isEditMode = !!gbvCase;
    const pageTitle = isEditMode ? "Edit GBV Case" : "Create New GBV Case";

    // Tab configuration
    const tabOrder = ["survivor", "incident", "perpetrators", "management"];
    const currentTabIndex = tabOrder.indexOf(activeTab);

    const getTabTitle = (tabKey) => {
        const titles = {
            survivor: "Survivor Information",
            incident: "Incident Details",
            perpetrators: "Perpetrator Information",
            management: "Case Management",
        };
        return titles[tabKey];
    };

    // Initialize location hook for incident location
    const locationData = useData("incident");

    const counties = locationData?.counties || [];
    const subCounties = locationData?.subCounties || [];
    const wards = locationData?.wards || [];
    const villages = locationData?.villages || [];
    const locationLoading = locationData?.loading || {
        counties: false,
        subCounties: false,
        wards: false,
        villages: false,
    };
    const selectedCounty = locationData?.selectedCounty || null;
    const selectedSubCounty = locationData?.selectedSubCounty || null;
    const selectedWard = locationData?.selectedWard || null;
    const selectedVillage = locationData?.selectedVillage || null;
    const handleCountyChange = locationData?.handleCountyChange || (() => {});
    const handleSubCountyChange =
        locationData?.handleSubCountyChange || (() => {});
    const handleWardChange = locationData?.handleWardChange || (() => {});
    const handleVillageChange = locationData?.handleVillageChange || (() => {});

    // State for perpetrators
    const [perpetrators, setPerpetrators] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        survivor_id: gbvCase?.survivor_id || "",
        incident_number: gbvCase?.incident_number || "",
        incident_type: gbvCase?.incident_type || "",
        incident_type_other: gbvCase?.incident_type_other || "",
        incident_date: gbvCase?.incident_date || "",
        incident_time: gbvCase?.incident_time || "",
        incident_location: gbvCase?.incident_location || "",
        county_id: gbvCase?.county_id || "",
        sub_county_id: gbvCase?.sub_county_id || "",
        ward_id: gbvCase?.ward_id || "",
        village_id: gbvCase?.village_id || "",
        description: gbvCase?.description || "",
        reported_to_police: gbvCase?.reported_to_police || false,
        police_station: gbvCase?.police_station || "",
        ob_number: gbvCase?.ob_number || "",
        medical_attention: gbvCase?.medical_attention || false,
        health_facility: gbvCase?.health_facility || "",
        priority: gbvCase?.priority || "normal",
        is_sensitive: gbvCase?.is_sensitive || false,
        primary_officer_id: gbvCase?.primary_officer_id || "",
        confidentiality_level: gbvCase?.confidentiality_level || "standard",
        consent_obtained: gbvCase?.consent_obtained || false,
        consent_details: gbvCase?.consent_details || "",
    });

    // Initialize perpetrators from gbvCase data
    useEffect(() => {
        if (gbvCase?.perpetrators?.length > 0) {
            setPerpetrators(
                gbvCase.perpetrators.map((p, index) => ({
                    id: p.id || Date.now() + index,
                    age_range: p.age_range || "",
                    gender: p.gender || "",
                    relationship: p.relationship || "",
                    name_known: p.name_known || false,
                    name: p.name || "",
                    relationship_details: p.relationship_details || "",
                })),
            );
        } else {
            // Add one empty perpetrator by default
            setPerpetrators([
                {
                    id: Date.now(),
                    age_range: "",
                    gender: "",
                    relationship: "",
                    name_known: false,
                    name: "",
                    relationship_details: "",
                },
            ]);
        }
    }, [gbvCase]);

    // Generate incident number for new cases
    useEffect(() => {
        if (!isEditMode && !data.incident_number) {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const random = Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0");
            setData("incident_number", `GBV-${year}${month}-${random}`);
        }
    }, [isEditMode]);

    // Set location data when editing
    useEffect(() => {
        if (isEditMode && gbvCase && counties.length > 0) {
            if (gbvCase.county_id) {
                const county = counties.find((c) => c.id === gbvCase.county_id);
                if (county && handleCountyChange) {
                    handleCountyChange({
                        value: county.id,
                        label: county.name,
                    });
                }
            }
        }
    }, [isEditMode, gbvCase, counties, handleCountyChange]);

    useEffect(() => {
        if (
            isEditMode &&
            gbvCase?.sub_county_id &&
            subCounties.length > 0 &&
            handleSubCountyChange
        ) {
            const subCounty = subCounties.find(
                (sc) => sc.id === gbvCase.sub_county_id,
            );
            if (subCounty) {
                handleSubCountyChange({
                    value: subCounty.id,
                    label: subCounty.name,
                });
            }
        }
    }, [isEditMode, gbvCase, subCounties, handleSubCountyChange]);

    useEffect(() => {
        if (
            isEditMode &&
            gbvCase?.ward_id &&
            wards.length > 0 &&
            handleWardChange
        ) {
            const ward = wards.find((w) => w.id === gbvCase.ward_id);
            if (ward) {
                handleWardChange({ value: ward.id, label: ward.name });
            }
        }
    }, [isEditMode, gbvCase, wards, handleWardChange]);

    useEffect(() => {
        if (
            isEditMode &&
            gbvCase?.village_id &&
            villages.length > 0 &&
            handleVillageChange
        ) {
            const village = villages.find((v) => v.id === gbvCase.village_id);
            if (village) {
                handleVillageChange({ value: village.id, label: village.name });
            }
        }
    }, [isEditMode, gbvCase, villages, handleVillageChange]);

    // Location change handlers
    const onCountyChange = (selected) => {
        if (handleCountyChange) handleCountyChange(selected);
        setData("county_id", selected ? selected.value : "");
        setData("sub_county_id", "");
        setData("ward_id", "");
        setData("village_id", "");
    };

    const onSubCountyChange = (selected) => {
        if (handleSubCountyChange) handleSubCountyChange(selected);
        setData("sub_county_id", selected ? selected.value : "");
        setData("ward_id", "");
        setData("village_id", "");
    };

    const onWardChange = (selected) => {
        if (handleWardChange) handleWardChange(selected);
        setData("ward_id", selected ? selected.value : "");
        setData("village_id", "");
    };

    const onVillageChange = (selected) => {
        if (handleVillageChange) handleVillageChange(selected);
        setData("village_id", selected ? selected.value : "");
    };

    // Perpetrator management
    const addPerpetrator = () => {
        setPerpetrators([
            ...perpetrators,
            {
                id: Date.now(),
                age_range: "",
                gender: "",
                relationship: "",
                name_known: false,
                name: "",
                relationship_details: "",
            },
        ]);
    };

    const removePerpetrator = (id) => {
        if (perpetrators.length > 1) {
            setPerpetrators(perpetrators.filter((p) => p.id !== id));
        } else {
            toast.warning("At least one perpetrator is required");
        }
    };

    const updatePerpetrator = (id, field, value) => {
        setPerpetrators(
            perpetrators.map((p) =>
                p.id === id ? { ...p, [field]: value } : p,
            ),
        );
    };

    // Validate current tab
    const validateCurrentTab = () => {
        switch (activeTab) {
            case "survivor":
                if (!data.survivor_id) {
                    toast.error("Please select a survivor");
                    return false;
                }
                break;
            case "incident":
                if (!data.incident_type) {
                    toast.error("Please select an incident type");
                    return false;
                }
                if (
                    data.incident_type === "other" &&
                    !data.incident_type_other
                ) {
                    toast.error("Please specify the incident type");
                    return false;
                }
                if (!data.incident_date) {
                    toast.error("Please select incident date");
                    return false;
                }
                break;
            case "perpetrators":
                // Validate at least one perpetrator has basic info
                const hasValidPerpetrator = perpetrators.some(
                    (p) => p.age_range || p.gender || p.relationship,
                );
                if (!hasValidPerpetrator) {
                    toast.warning(
                        "Please provide basic information for at least one perpetrator",
                    );
                }
                break;
            case "management":
                if (data.is_sensitive && !data.consent_obtained) {
                    toast.error("Consent is required for sensitive cases");
                    return false;
                }
                if (!data.primary_officer_id) {
                    toast.warning(
                        "Please assign a primary officer for this case",
                    );
                }
                break;
            default:
                break;
        }
        return true;
    };

    const handleNextTab = () => {
        if (validateCurrentTab()) {
            if (currentTabIndex < tabOrder.length - 1) {
                setActiveTab(tabOrder[currentTabIndex + 1]);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    const handlePreviousTab = () => {
        if (currentTabIndex > 0) {
            setActiveTab(tabOrder[currentTabIndex - 1]);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Final validation before submit
            if (!data.survivor_id) {
                setActiveTab("survivor");
                toast.error("Please select a survivor");
                return;
            }

            if (!data.incident_type) {
                setActiveTab("incident");
                toast.error("Please select an incident type");
                return;
            }

            if (data.incident_type === "other" && !data.incident_type_other) {
                setActiveTab("incident");
                toast.error("Please specify the incident type");
                return;
            }

            if (!data.incident_date) {
                setActiveTab("incident");
                toast.error("Please select incident date");
                return;
            }

            if (data.is_sensitive && !data.consent_obtained) {
                setActiveTab("management");
                toast.error("Please provide consent for this sensitive case");
                return;
            }

            // Sweet alert for submit confirmation
            const result = await Swal.fire({
                title: `Are you sure you want to ${isEditMode ? "update" : "create"} this GBV case?`,
                html: `<div class="text-start">
                    <p><strong>Case Number:</strong> ${data.incident_number}</p>
                    <p><strong>Incident Type:</strong> ${incidentTypes?.find((t) => t.value === data.incident_type)?.label || data.incident_type}</p>
                    <p><strong>Priority:</strong> ${priorityLevels?.find((p) => p.value === data.priority)?.label || data.priority}</p>
                </div>`,
                icon: "warning",
                showDenyButton: true,
                confirmButtonText: "Yes, proceed",
                denyButtonText: "No, cancel",
            });

            if (!result.isConfirmed) {
                return;
            }

            // Show loading swal
            Swal.fire({
                title: "Please wait...",
                icon: "info",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            // Prepare data for submission
            const submitData = {
                ...data,
                perpetrators: perpetrators.map(({ id, ...perp }) => perp),
            };

            const postRoute = isEditMode
                ? route("gbv-cases.update", gbvCase.id)
                : route("gbv-cases.store");

            const response = await xios.post(postRoute, {
                ...submitData,
                _method: isEditMode ? "PUT" : "POST",
            });

            if (response.data.success) {
                toast.success(response.data.message);
                window.location.href = route("gbv-cases.index");
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            Swal.close();
        }
    };

    // Helper components
    const HelpTooltip = ({ text, id }) => (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-${id}`}>{text}</Tooltip>}
        >
            <Info
                size={16}
                className="text-muted ms-1 cursor-help"
                style={{ cursor: "help" }}
            />
        </OverlayTrigger>
    );

    const formatIncidentOption = (option) => (
        <div className="d-flex align-items-center gap-2">
            <span className="fs-4">{option.icon || "📌"}</span>
            <div>
                <strong>{option.label}</strong>
                <small className="text-muted d-block text-capitalize">
                    {option.category}
                </small>
            </div>
        </div>
    );

    // Format options for selects
    const survivorOptions =
        survivors?.map((s) => ({
            value: s.id,
            label: s.full_name || s.name || `Survivor #${s.id}`,
            ...s,
        })) || [];

    const officerOptions =
        officers?.map((o) => ({
            value: o.id,
            label: o.name || o.full_name || `Officer #${o.id}`,
        })) || [];

    const countyOptions = counties.map((county) => ({
        value: county.id,
        label: county.name,
    }));

    const subCountyOptions = subCounties.map((subCounty) => ({
        value: subCounty.id,
        label: subCounty.name,
    }));

    const wardOptions = wards.map((ward) => ({
        value: ward.id,
        label: ward.name,
    }));

    const villageOptions = villages.map((village) => ({
        value: village.id,
        label: village.name,
    }));

    const incidentTypeOptions = incidentTypes || [];
    const priorityOptions = priorityLevels || [];
    const confidentialityOptions = confidentialityLevels || [];

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
            boxShadow: state.isFocused
                ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
                : "none",
            "&:hover": { borderColor: "#86b7fe" },
            minHeight: "38px",
        }),
        menu: (base) => ({ ...base, zIndex: 100 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#0d6efd"
                : state.isFocused
                  ? "#e7f1ff"
                  : "white",
            color: state.isSelected ? "white" : "#212529",
            cursor: "pointer",
        }),
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={pageTitle} />

            {/* Header */}
            <Row className="mb-4 g-3 align-items-center">
                <Col md={8}>
                    <PageTitle
                        title={pageTitle}
                        icon="🛡️"
                        description="Complete the following tabs to register a new GBV case with confidentiality and care."
                    />
                </Col>
                <Col md={4} className="text-md-end">
                    <Button
                        as={Link}
                        href={route("gbv-cases.index")}
                        variant="outline-danger"
                    >
                        <BiXCircle className="me-2" />
                        Cancel
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Body>
                    {/* Progress Indicator */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center py-2">
                            {tabOrder.map((tab, index) => (
                                <div
                                    key={tab}
                                    className="text-center flex-grow-1"
                                >
                                    <div
                                        className={`rounded-circle bg-${
                                            index <= currentTabIndex
                                                ? "primary"
                                                : "secondary"
                                        } bg-opacity-${index <= currentTabIndex ? "100" : "25"} d-flex align-items-center justify-content-center mx-auto mb-2`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            if (index <= currentTabIndex) {
                                                setActiveTab(tab);
                                            } else {
                                                toast.info(
                                                    `Please complete ${getTabTitle(
                                                        tabOrder[
                                                            currentTabIndex
                                                        ],
                                                    )} first`,
                                                );
                                            }
                                        }}
                                    >
                                        <span
                                            className={`text-${
                                                index <= currentTabIndex
                                                    ? "white"
                                                    : "secondary"
                                            } fw-bold`}
                                        >
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div
                                        className={`small fw-${
                                            index === currentTabIndex
                                                ? "bold"
                                                : "normal"
                                        } text-${index === currentTabIndex ? "primary" : "secondary"}`}
                                    >
                                        {getTabTitle(tab)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="progress" style={{ height: "2px" }}>
                            <div
                                className="progress-bar bg-primary"
                                role="progressbar"
                                style={{
                                    width: `${((currentTabIndex + 1) / tabOrder.length) * 100}%`,
                                }}
                                aria-valuenow={
                                    ((currentTabIndex + 1) / tabOrder.length) *
                                    100
                                }
                                aria-valuemin="0"
                                aria-valuemax="100"
                            />
                        </div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        {/* Survivor Information Tab */}
                        {activeTab === "survivor" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <User
                                            size={20}
                                            className="text-primary"
                                        />
                                        Survivor Information
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Link this case to an existing survivor
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={8} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Select Survivor{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                    <HelpTooltip
                                                        text="Choose an existing survivor from the database"
                                                        id="survivor-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={survivorOptions}
                                                    value={
                                                        survivorOptions.find(
                                                            (option) =>
                                                                option.value ===
                                                                data.survivor_id,
                                                        ) || null
                                                    }
                                                    onChange={(selected) =>
                                                        setData(
                                                            "survivor_id",
                                                            selected
                                                                ? selected.value
                                                                : "",
                                                        )
                                                    }
                                                    placeholder="Search and select survivor..."
                                                    isSearchable
                                                    styles={selectStyles}
                                                    noOptionsMessage={() =>
                                                        "No survivors found"
                                                    }
                                                />
                                                {errors.survivor_id && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.survivor_id}
                                                    </div>
                                                )}
                                                <Form.Text className="text-muted">
                                                    Can't find the survivor?{" "}
                                                    <Link
                                                        href={route(
                                                            "survivors.create",
                                                        )}
                                                        className="text-primary text-decoration-none fw-semibold"
                                                    >
                                                        Register new survivor
                                                    </Link>
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Case Number
                                                    <HelpTooltip
                                                        text="Unique identifier for this case (auto-generated)"
                                                        id="case-number-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.incident_number}
                                                    onChange={(e) =>
                                                        setData(
                                                            "incident_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.incident_number
                                                    }
                                                    className="bg-light"
                                                    readOnly={!isEditMode}
                                                />
                                                {errors.incident_number && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.incident_number}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="info" className="mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <Info size={20} />
                                            <div>
                                                <strong>
                                                    Confidentiality Notice:
                                                </strong>{" "}
                                                All survivor information is
                                                handled with strict
                                                confidentiality according to GBV
                                                case management guidelines.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Incident Details Tab */}
                        {activeTab === "incident" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <AlertTriangle
                                            size={20}
                                            className="text-danger"
                                        />
                                        Incident Details
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Document the details of the incident
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={12} className="mb-4">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Incident Type{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                    <HelpTooltip
                                                        text="Select the type of GBV incident"
                                                        id="incident-type-help"
                                                    />
                                                </Form.Label>
                                                <Row className="g-3">
                                                    {incidentTypeOptions.map(
                                                        (type) => (
                                                            <Col
                                                                md={4}
                                                                key={type.value}
                                                            >
                                                                <div
                                                                    className={`incident-type-card p-3 border rounded-3 ${
                                                                        data.incident_type ===
                                                                        type.value
                                                                            ? "border-primary bg-primary bg-opacity-10"
                                                                            : "border-secondary"
                                                                    }`}
                                                                    onClick={() =>
                                                                        setData(
                                                                            "incident_type",
                                                                            type.value,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        transition:
                                                                            "all 0.2s",
                                                                    }}
                                                                >
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <span className="fs-2">
                                                                            {type.icon ||
                                                                                "📌"}
                                                                        </span>
                                                                        <div>
                                                                            <strong className="d-block">
                                                                                {
                                                                                    type.label
                                                                                }
                                                                            </strong>
                                                                            <small className="text-muted text-capitalize">
                                                                                {
                                                                                    type.category
                                                                                }
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        ),
                                                    )}
                                                </Row>
                                                {errors.incident_type && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.incident_type}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {data.incident_type === "other" && (
                                        <Row>
                                            <Col md={12} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Specify Other Incident
                                                        Type{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={
                                                            data.incident_type_other
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "incident_type_other",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Please specify the incident type..."
                                                        className="border-2"
                                                        isInvalid={
                                                            !!errors.incident_type_other
                                                        }
                                                    />
                                                    {errors.incident_type_other && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {
                                                                errors.incident_type_other
                                                            }
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}

                                    <Row>
                                        <Col md={6} className="mb-4">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Date of Incident{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                    <HelpTooltip
                                                        text="When did the incident occur?"
                                                        id="incident-date-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={data.incident_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "incident_date",
                                                            e.target.value,
                                                        )
                                                    }
                                                    max={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                    className="border-2"
                                                    isInvalid={
                                                        !!errors.incident_date
                                                    }
                                                />
                                                {errors.incident_date && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.incident_date}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-4">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Time of Incident
                                                    <HelpTooltip
                                                        text="Approximate time when the incident occurred"
                                                        id="incident-time-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    value={data.incident_time}
                                                    onChange={(e) =>
                                                        setData(
                                                            "incident_time",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-2"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Card className="mb-4 border-0 bg-light">
                                        <Card.Header className="bg-transparent border-0 pt-3">
                                            <h6 className="mb-0 d-flex align-items-center gap-2">
                                                <MapPin
                                                    size={18}
                                                    className="text-primary"
                                                />
                                                Incident Location
                                            </h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            County
                                                            <HelpTooltip
                                                                text="County where the incident occurred"
                                                                id="county-help"
                                                            />
                                                        </Form.Label>
                                                        <Select
                                                            options={
                                                                countyOptions
                                                            }
                                                            value={
                                                                selectedCounty
                                                            }
                                                            onChange={
                                                                onCountyChange
                                                            }
                                                            isLoading={
                                                                locationLoading?.counties
                                                            }
                                                            isClearable
                                                            placeholder="Select county"
                                                            styles={
                                                                selectStyles
                                                            }
                                                            noOptionsMessage={() =>
                                                                "No counties found"
                                                            }
                                                        />
                                                        {errors.county_id && (
                                                            <div className="text-danger small mt-1">
                                                                {
                                                                    errors.county_id
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Sub County
                                                        </Form.Label>
                                                        <Select
                                                            options={
                                                                subCountyOptions
                                                            }
                                                            value={
                                                                selectedSubCounty
                                                            }
                                                            onChange={
                                                                onSubCountyChange
                                                            }
                                                            isLoading={
                                                                locationLoading?.subCounties
                                                            }
                                                            isClearable
                                                            isDisabled={
                                                                !selectedCounty ||
                                                                locationLoading?.subCounties
                                                            }
                                                            placeholder={
                                                                !selectedCounty
                                                                    ? "Select county first"
                                                                    : "Select sub county"
                                                            }
                                                            styles={
                                                                selectStyles
                                                            }
                                                            noOptionsMessage={() =>
                                                                "No sub-counties found"
                                                            }
                                                        />
                                                        {errors.sub_county_id && (
                                                            <div className="text-danger small mt-1">
                                                                {
                                                                    errors.sub_county_id
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Ward
                                                        </Form.Label>
                                                        <Select
                                                            options={
                                                                wardOptions
                                                            }
                                                            value={selectedWard}
                                                            onChange={
                                                                onWardChange
                                                            }
                                                            isLoading={
                                                                locationLoading?.wards
                                                            }
                                                            isClearable
                                                            isDisabled={
                                                                !selectedSubCounty ||
                                                                locationLoading?.wards
                                                            }
                                                            placeholder={
                                                                !selectedSubCounty
                                                                    ? "Select sub-county first"
                                                                    : "Select ward"
                                                            }
                                                            styles={
                                                                selectStyles
                                                            }
                                                            noOptionsMessage={() =>
                                                                "No wards found"
                                                            }
                                                        />
                                                        {errors.ward_id && (
                                                            <div className="text-danger small mt-1">
                                                                {errors.ward_id}
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Village
                                                        </Form.Label>
                                                        <Select
                                                            options={
                                                                villageOptions
                                                            }
                                                            value={
                                                                selectedVillage
                                                            }
                                                            onChange={
                                                                onVillageChange
                                                            }
                                                            isLoading={
                                                                locationLoading?.villages
                                                            }
                                                            isClearable
                                                            isDisabled={
                                                                !selectedWard ||
                                                                locationLoading?.villages
                                                            }
                                                            placeholder={
                                                                !selectedWard
                                                                    ? "Select ward first"
                                                                    : "Select village"
                                                            }
                                                            styles={
                                                                selectStyles
                                                            }
                                                            noOptionsMessage={() =>
                                                                "No villages found"
                                                            }
                                                        />
                                                        {errors.village_id && (
                                                            <div className="text-danger small mt-1">
                                                                {
                                                                    errors.village_id
                                                                }
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={12} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Specific Location
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={
                                                                data.incident_location
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "incident_location",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Enter specific location (e.g., building name, landmark)"
                                                            className="border-2"
                                                            isInvalid={
                                                                !!errors.incident_location
                                                            }
                                                        />
                                                        {errors.incident_location && (
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    errors.incident_location
                                                                }
                                                            </Form.Control.Feedback>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <Row>
                                        <Col md={12} className="mb-4">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Detailed Description
                                                    <HelpTooltip
                                                        text="Provide a comprehensive description of what happened"
                                                        id="description-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    value={data.description}
                                                    onChange={(e) =>
                                                        setData(
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Describe the incident in detail. Include what happened, when, where, and any witnesses if applicable..."
                                                    className="border-2"
                                                    isInvalid={
                                                        !!errors.description
                                                    }
                                                />
                                                {errors.description && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.description}
                                                    </Form.Control.Feedback>
                                                )}
                                                <Form.Text className="text-muted">
                                                    Include relevant details
                                                    such as time, location, and
                                                    any witnesses if applicable.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Card className="border-0 bg-light mb-4">
                                                <Card.Body>
                                                    <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                                        <Shield size={18} />
                                                        Police Involvement
                                                    </h6>
                                                    <Form.Check
                                                        type="switch"
                                                        id="reported-to-police"
                                                        label="Reported to police"
                                                        checked={
                                                            data.reported_to_police
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "reported_to_police",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="mb-3"
                                                    />
                                                    {data.reported_to_police && (
                                                        <Row>
                                                            <Col
                                                                md={6}
                                                                className="mb-2"
                                                            >
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="Police Station"
                                                                    value={
                                                                        data.police_station
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            "police_station",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    isInvalid={
                                                                        !!errors.police_station
                                                                    }
                                                                />
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Control
                                                                    type="text"
                                                                    placeholder="OB Number"
                                                                    value={
                                                                        data.ob_number
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setData(
                                                                            "ob_number",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    isInvalid={
                                                                        !!errors.ob_number
                                                                    }
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col md={6}>
                                            <Card className="border-0 bg-light mb-4">
                                                <Card.Body>
                                                    <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                                        <Heart size={18} />
                                                        Medical Attention
                                                    </h6>
                                                    <Form.Check
                                                        type="switch"
                                                        id="medical-attention"
                                                        label="Received medical attention"
                                                        checked={
                                                            data.medical_attention
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "medical_attention",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="mb-3"
                                                    />
                                                    {data.medical_attention && (
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Health Facility"
                                                            value={
                                                                data.health_facility
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "health_facility",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            isInvalid={
                                                                !!errors.health_facility
                                                            }
                                                        />
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Alert variant="warning" className="mt-3">
                                        <div className="d-flex gap-2">
                                            <AlertCircle
                                                size={16}
                                                className="flex-shrink-0 mt-1"
                                            />
                                            <div>
                                                <strong>Safety First:</strong>{" "}
                                                Document only what is necessary
                                                for case management. Prioritize
                                                survivor safety in all
                                                documentation.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Perpetrator Information Tab */}
                        {activeTab === "perpetrators" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                        <h4 className="mb-0 d-flex align-items-center gap-2">
                                            <Users
                                                size={20}
                                                className="text-danger"
                                            />
                                            Perpetrator Information
                                        </h4>
                                        <p className="text-muted small mt-1">
                                            Add details about the alleged
                                            perpetrator(s)
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        onClick={addPerpetrator}
                                        className="rounded-pill px-4"
                                    >
                                        <Plus size={16} className="me-2" />
                                        Add Perpetrator
                                    </Button>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    {perpetrators.map((perpetrator, index) => (
                                        <Card
                                            key={perpetrator.id}
                                            className="mb-4 border-0 bg-light"
                                        >
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-semibold mb-0">
                                                        Perpetrator {index + 1}
                                                    </h6>
                                                    {perpetrators.length >
                                                        1 && (
                                                        <Button
                                                            variant="link"
                                                            className="text-danger p-0 text-decoration-none"
                                                            onClick={() =>
                                                                removePerpetrator(
                                                                    perpetrator.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                                </div>

                                                <Row>
                                                    <Col
                                                        md={4}
                                                        className="mb-3"
                                                    >
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold">
                                                                Age Range
                                                                <HelpTooltip
                                                                    text="Estimated age range of the perpetrator"
                                                                    id="perp-age-help"
                                                                />
                                                            </Form.Label>
                                                            <Select
                                                                options={
                                                                    ageRangeOptions
                                                                }
                                                                value={
                                                                    ageRangeOptions?.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            perpetrator.age_range,
                                                                    ) || null
                                                                }
                                                                onChange={(
                                                                    selected,
                                                                ) =>
                                                                    updatePerpetrator(
                                                                        perpetrator.id,
                                                                        "age_range",
                                                                        selected
                                                                            ? selected.value
                                                                            : "",
                                                                    )
                                                                }
                                                                placeholder="Select age range"
                                                                styles={
                                                                    selectStyles
                                                                }
                                                                isClearable
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col
                                                        md={4}
                                                        className="mb-3"
                                                    >
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold">
                                                                Gender
                                                            </Form.Label>
                                                            <Select
                                                                options={
                                                                    genderOptions
                                                                }
                                                                value={
                                                                    genderOptions?.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            perpetrator.gender,
                                                                    ) || null
                                                                }
                                                                onChange={(
                                                                    selected,
                                                                ) =>
                                                                    updatePerpetrator(
                                                                        perpetrator.id,
                                                                        "gender",
                                                                        selected
                                                                            ? selected.value
                                                                            : "",
                                                                    )
                                                                }
                                                                placeholder="Select gender"
                                                                styles={
                                                                    selectStyles
                                                                }
                                                                isClearable
                                                            />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col
                                                        md={4}
                                                        className="mb-3"
                                                    >
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold">
                                                                Relationship to
                                                                Survivor
                                                                <HelpTooltip
                                                                    text="What is the relationship between perpetrator and survivor?"
                                                                    id="perp-relation-help"
                                                                />
                                                            </Form.Label>
                                                            <Select
                                                                options={
                                                                    relationshipOptions
                                                                }
                                                                value={
                                                                    relationshipOptions?.find(
                                                                        (opt) =>
                                                                            opt.value ===
                                                                            perpetrator.relationship,
                                                                    ) || null
                                                                }
                                                                onChange={(
                                                                    selected,
                                                                ) =>
                                                                    updatePerpetrator(
                                                                        perpetrator.id,
                                                                        "relationship",
                                                                        selected
                                                                            ? selected.value
                                                                            : "",
                                                                    )
                                                                }
                                                                placeholder="Select relationship"
                                                                styles={
                                                                    selectStyles
                                                                }
                                                                isClearable
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col
                                                        md={12}
                                                        className="mb-3"
                                                    >
                                                        <Form.Group>
                                                            <Form.Label className="small fw-semibold">
                                                                Is the
                                                                perpetrator's
                                                                name known?
                                                            </Form.Label>
                                                            <div>
                                                                <Form.Check
                                                                    type="radio"
                                                                    inline
                                                                    label="Yes"
                                                                    name={`name_known_${perpetrator.id}`}
                                                                    checked={
                                                                        perpetrator.name_known ===
                                                                        true
                                                                    }
                                                                    onChange={() =>
                                                                        updatePerpetrator(
                                                                            perpetrator.id,
                                                                            "name_known",
                                                                            true,
                                                                        )
                                                                    }
                                                                />
                                                                <Form.Check
                                                                    type="radio"
                                                                    inline
                                                                    label="No"
                                                                    name={`name_known_${perpetrator.id}`}
                                                                    checked={
                                                                        perpetrator.name_known ===
                                                                        false
                                                                    }
                                                                    onChange={() =>
                                                                        updatePerpetrator(
                                                                            perpetrator.id,
                                                                            "name_known",
                                                                            false,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {perpetrator.name_known && (
                                                    <Row>
                                                        <Col
                                                            md={6}
                                                            className="mb-3"
                                                        >
                                                            <Form.Group>
                                                                <Form.Label className="small fw-semibold">
                                                                    Perpetrator
                                                                    Name
                                                                    <HelpTooltip
                                                                        text="Full name if known (consider safety implications)"
                                                                        id="perp-name-help"
                                                                    />
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={
                                                                        perpetrator.name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updatePerpetrator(
                                                                            perpetrator.id,
                                                                            "name",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="Enter full name if known"
                                                                    className="border-2"
                                                                />
                                                            </Form.Group>
                                                        </Col>

                                                        <Col
                                                            md={6}
                                                            className="mb-3"
                                                        >
                                                            <Form.Group>
                                                                <Form.Label className="small fw-semibold">
                                                                    Relationship
                                                                    Details
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={
                                                                        perpetrator.relationship_details
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updatePerpetrator(
                                                                            perpetrator.id,
                                                                            "relationship_details",
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="E.g., maternal uncle, neighbor, teacher, etc."
                                                                    className="border-2"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    ))}

                                    <Alert variant="warning" className="mt-3">
                                        <div className="d-flex gap-2">
                                            <AlertCircle
                                                size={16}
                                                className="flex-shrink-0 mt-1"
                                            />
                                            <div>
                                                <strong>Safety First:</strong>{" "}
                                                Only collect perpetrator
                                                information that is safely
                                                obtainable. Prioritize survivor
                                                safety in all documentation.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Case Management Tab */}
                        {activeTab === "management" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <Shield
                                            size={20}
                                            className="text-primary"
                                        />
                                        Case Management
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Configure case handling and
                                        confidentiality settings
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={6} className="mb-4">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Priority Level
                                                    <HelpTooltip
                                                        text="Set the urgency of this case"
                                                        id="priority-help"
                                                    />
                                                </Form.Label>
                                                <div className="priority-options">
                                                    {priorityOptions.map(
                                                        (level) => (
                                                            <div
                                                                key={
                                                                    level.value
                                                                }
                                                                className={`priority-card p-3 border rounded-3 mb-2 ${
                                                                    data.priority ===
                                                                    level.value
                                                                        ? `border-${level.color} bg-${level.color} bg-opacity-10`
                                                                        : "border-secondary"
                                                                }`}
                                                                onClick={() =>
                                                                    setData(
                                                                        "priority",
                                                                        level.value,
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                    transition:
                                                                        "all 0.2s",
                                                                }}
                                                            >
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div
                                                                        className={`bg-${level.color} rounded-circle`}
                                                                        style={{
                                                                            width: "12px",
                                                                            height: "12px",
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <strong className="d-block">
                                                                            {
                                                                                level.label
                                                                            }
                                                                        </strong>
                                                                        <small className="text-muted">
                                                                            {
                                                                                level.description
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                {errors.priority && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.priority}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold">
                                                    Assign Primary Officer
                                                    <HelpTooltip
                                                        text="Main case worker responsible for this case"
                                                        id="officer-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={officerOptions}
                                                    value={
                                                        officerOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                data.primary_officer_id,
                                                        ) || null
                                                    }
                                                    onChange={(selected) =>
                                                        setData(
                                                            "primary_officer_id",
                                                            selected
                                                                ? selected.value
                                                                : "",
                                                        )
                                                    }
                                                    placeholder="Select primary officer..."
                                                    styles={selectStyles}
                                                    isClearable
                                                />
                                                {errors.primary_officer_id && (
                                                    <div className="text-danger small mt-2">
                                                        {
                                                            errors.primary_officer_id
                                                        }
                                                    </div>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-semibold">
                                                    Confidentiality Level
                                                    <HelpTooltip
                                                        text="Controls who can access this case"
                                                        id="confidentiality-help"
                                                    />
                                                </Form.Label>
                                                {confidentialityOptions.map(
                                                    (level) => (
                                                        <div
                                                            key={level.value}
                                                            className="mb-3"
                                                        >
                                                            <Form.Check
                                                                type="radio"
                                                                id={`conf-${level.value}`}
                                                                name="confidentiality"
                                                                label={
                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                level.label
                                                                            }
                                                                        </strong>
                                                                        <p className="text-muted small mb-0">
                                                                            {
                                                                                level.description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                }
                                                                value={
                                                                    level.value
                                                                }
                                                                checked={
                                                                    data.confidentiality_level ===
                                                                    level.value
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "confidentiality_level",
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 bg-light mt-4">
                                        <Card.Body>
                                            <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                                                <Shield size={18} />
                                                Consent and Confidentiality
                                            </h6>

                                            <Form.Check
                                                type="switch"
                                                id="consent-obtained"
                                                label={
                                                    <span>
                                                        I have obtained informed
                                                        consent from the
                                                        survivor
                                                        <HelpTooltip
                                                            text="Survivor has agreed to case documentation and information sharing"
                                                            id="consent-help"
                                                        />
                                                    </span>
                                                }
                                                checked={data.consent_obtained}
                                                onChange={(e) =>
                                                    setData(
                                                        "consent_obtained",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="mb-3"
                                            />

                                            {data.consent_obtained && (
                                                <Form.Group className="mt-3">
                                                    <Form.Label className="fw-semibold">
                                                        Consent Details
                                                        <small className="text-muted ms-2">
                                                            (Optional)
                                                        </small>
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={2}
                                                        value={
                                                            data.consent_details
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "consent_details",
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Document any specific consent agreements or limitations..."
                                                        className="border-2"
                                                    />
                                                </Form.Group>
                                            )}

                                            <Form.Check
                                                type="switch"
                                                id="sensitive-case"
                                                label={
                                                    <span className="mt-3">
                                                        Mark as sensitive case
                                                        <HelpTooltip
                                                            text="Restricted access - only senior staff can view"
                                                            id="sensitive-help"
                                                        />
                                                    </span>
                                                }
                                                checked={data.is_sensitive}
                                                onChange={(e) =>
                                                    setData(
                                                        "is_sensitive",
                                                        e.target.checked,
                                                    )
                                                }
                                                className="mt-3"
                                            />

                                            {data.is_sensitive && (
                                                <Alert
                                                    variant="danger"
                                                    className="mt-3"
                                                >
                                                    <div className="d-flex gap-2">
                                                        <AlertCircle
                                                            size={16}
                                                        />
                                                        <div>
                                                            <strong>
                                                                Restricted
                                                                Access:
                                                            </strong>{" "}
                                                            This case will only
                                                            be visible to senior
                                                            staff and authorized
                                                            personnel.
                                                        </div>
                                                    </div>
                                                </Alert>
                                            )}
                                        </Card.Body>
                                    </Card>

                                    <Alert variant="info" className="mt-4">
                                        <div className="d-flex gap-2">
                                            <Info size={20} />
                                            <div>
                                                <strong>
                                                    Data Protection:
                                                </strong>{" "}
                                                All case information is stored
                                                securely and access is
                                                restricted to authorized
                                                personnel only. Regular audits
                                                are conducted to ensure data
                                                privacy.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="d-flex justify-content-between align-items-center gap-2 mt-4">
                            <div>
                                {currentTabIndex > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline-secondary"
                                        onClick={handlePreviousTab}
                                        className="rounded-pill px-4"
                                    >
                                        <ChevronLeft
                                            size={16}
                                            className="me-2"
                                        />
                                        Previous:{" "}
                                        {getTabTitle(
                                            tabOrder[currentTabIndex - 1],
                                        )}
                                    </Button>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                <Link
                                    href={route("gbv-cases.index")}
                                    className="btn btn-outline-danger rounded-pill px-4"
                                >
                                    <X size={16} className="me-2" />
                                    Cancel
                                </Link>

                                {currentTabIndex < tabOrder.length - 1 ? (
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleNextTab}
                                        className="rounded-pill px-4"
                                    >
                                        Next:{" "}
                                        {getTabTitle(
                                            tabOrder[currentTabIndex + 1],
                                        )}
                                        <ChevronRight
                                            size={16}
                                            className="ms-2"
                                        />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        variant="success"
                                        disabled={processing}
                                        className="rounded-pill px-4"
                                    >
                                        <Save size={16} className="me-2" />
                                        {processing
                                            ? isEditMode
                                                ? "Updating..."
                                                : "Creating..."
                                            : isEditMode
                                              ? "Update Case"
                                              : "Create Case"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </AuthenticatedLayout>
    );
}
