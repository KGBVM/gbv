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
    Save,
    X,
    Info,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Phone,
    Shield,
    IdCard,
    Heart,
    User,
} from "lucide-react";
import { toast } from "react-toastify";
import { BiXCircle } from "react-icons/bi";
import { useErrorToast } from "@/hooks/useErrorToast";
import Swal from "sweetalert2";
import xios from "@/Utils/xios";

export default function CreateEdit({ auth, constants, survivor = null }) {
    const { idTypes, ageRangeOptions, genderOptions, disabilityTypes } =
        constants;
    const [activeTab, setActiveTab] = useState("basic");
    const { showErrorToast } = useErrorToast();
    const isEditMode = !!survivor;
    const pageTitle = isEditMode ? "Edit Survivor" : "Register New Survivor";

    // Tab configuration
    const tabOrder = [
        "basic",
        "location",
        "pwd",
        "identification",
        "emergency",
        "consent",
    ];
    const currentTabIndex = tabOrder.indexOf(activeTab);

    const getTabTitle = (tabKey) => {
        const titles = {
            basic: "Basic Information",
            location: "Location Details",
            pwd: "PWD Information",
            identification: "Identification",
            emergency: "Emergency Contact",
            consent: "Consent & Confidentiality",
        };
        return titles[tabKey];
    };

    // Calculate age from date of birth
    const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        return age;
    };

    // Initialize location hook for survivor location
    const locationData = useData("survivor");

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

    // State for multiple disability types
    const [selectedDisabilityTypes, setSelectedDisabilityTypes] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        full_name: survivor?.full_name || "",
        phone: survivor?.phone || "",
        alternate_phone: survivor?.alternate_phone || "",
        gender: survivor?.gender || "",
        dob: survivor?.dob || "",
        age_bracket: survivor?.age_bracket || "",
        is_pwd: survivor?.is_pwd || false,
        disability_types: survivor?.disability_types || [],
        pwd_registration_number: survivor?.pwd_registration_number || "",
        id_number: survivor?.id_number || "",
        id_type: survivor?.id_type || "",
        county_id: survivor?.county_id || "",
        sub_county_id: survivor?.sub_county_id || "",
        ward_id: survivor?.ward_id || "",
        village_id: survivor?.village_id || "",
        landmark: survivor?.landmark || "",
        location_coordinates: survivor?.location_coordinates || null,
        anonymous: survivor?.anonymous || false,
        consent_given: survivor?.consent_given ?? true,
        emergency_contact_name: survivor?.emergency_contact_name || "",
        emergency_contact_phone: survivor?.emergency_contact_phone || "",
        emergency_contact_relation: survivor?.emergency_contact_relation || "",
        metadata: survivor?.metadata || {},
    });

    // Initialize disability types from survivor data
    useEffect(() => {
        if (survivor?.disability_types && disabilityTypes) {
            const initialTypes = disabilityTypes
                .filter((type) =>
                    survivor.disability_types.includes(type.value),
                )
                .map((type) => ({
                    value: type.value,
                    label: type.label,
                    icon: type.icon,
                }));
            setSelectedDisabilityTypes(initialTypes);
        }
    }, [survivor, disabilityTypes]);

    // Auto-calculate age bracket when DOB changes
    useEffect(() => {
        if (data.dob && ageRangeOptions) {
            const age = calculateAge(data.dob);
            let bracket = "";

            if (age <= 16) bracket = "0-16";
            else if (age <= 35) bracket = "17-35";
            else if (age <= 60) bracket = "36-60";
            else bracket = "60+";

            const foundBracket = ageRangeOptions.find(
                (opt) => opt.value === bracket,
            );
            if (foundBracket && data.age_bracket !== bracket) {
                setData("age_bracket", bracket);
            }
        }
    }, [data.dob, ageRangeOptions, setData]);

    // Set location data when editing
    useEffect(() => {
        if (isEditMode && survivor && counties.length > 0) {
            if (survivor.county_id) {
                const county = counties.find(
                    (c) => c.id === survivor.county_id,
                );
                if (county && handleCountyChange) {
                    handleCountyChange({
                        value: county.id,
                        label: county.name,
                    });
                }
            }
        }
    }, [isEditMode, survivor, counties, handleCountyChange]);

    useEffect(() => {
        if (
            isEditMode &&
            survivor?.sub_county_id &&
            subCounties.length > 0 &&
            handleSubCountyChange
        ) {
            const subCounty = subCounties.find(
                (sc) => sc.id === survivor.sub_county_id,
            );
            if (subCounty) {
                handleSubCountyChange({
                    value: subCounty.id,
                    label: subCounty.name,
                });
            }
        }
    }, [isEditMode, survivor, subCounties, handleSubCountyChange]);

    useEffect(() => {
        if (
            isEditMode &&
            survivor?.ward_id &&
            wards.length > 0 &&
            handleWardChange
        ) {
            const ward = wards.find((w) => w.id === survivor.ward_id);
            if (ward) {
                handleWardChange({ value: ward.id, label: ward.name });
            }
        }
    }, [isEditMode, survivor, wards, handleWardChange]);

    useEffect(() => {
        if (
            isEditMode &&
            survivor?.village_id &&
            villages.length > 0 &&
            handleVillageChange
        ) {
            const village = villages.find((v) => v.id === survivor.village_id);
            if (village) {
                handleVillageChange({ value: village.id, label: village.name });
            }
        }
    }, [isEditMode, survivor, villages, handleVillageChange]);

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

    // Handle disability types change
    const handleDisabilityTypesChange = (selected) => {
        setSelectedDisabilityTypes(selected || []);
        setData(
            "disability_types",
            selected ? selected.map((opt) => opt.value) : [],
        );
    };

    // Validate current tab
    const validateCurrentTab = () => {
        switch (activeTab) {
            case "basic":
                if (!data.anonymous && !data.full_name) {
                    toast.error("Please enter survivor's full name");
                    return false;
                }
                if (!data.gender) {
                    toast.error("Please select gender");
                    return false;
                }
                break;
            case "location":
                if (!data.county_id) {
                    toast.error("Please select county");
                    return false;
                }
                break;
            case "pwd":
                if (data.is_pwd && !data.disability_types?.length) {
                    toast.error("Please select at least one disability type");
                    return false;
                }
                break;
            case "consent":
                if (!data.consent_given) {
                    toast.error(
                        "Please confirm consent to register this survivor",
                    );
                    return false;
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
            if (!data.anonymous && !data.full_name) {
                setActiveTab("basic");
                toast.error("Please enter survivor's full name");
                return;
            }

            if (!data.gender) {
                setActiveTab("basic");
                toast.error("Please select gender");
                return;
            }

            if (!data.county_id) {
                setActiveTab("location");
                toast.error("Please select county");
                return;
            }

            if (
                data.is_pwd &&
                (!data.disability_types || data.disability_types.length === 0)
            ) {
                setActiveTab("pwd");
                toast.error("Please select at least one disability type");
                return;
            }

            if (!data.consent_given) {
                setActiveTab("consent");
                toast.error("Please provide consent for this survivor");
                return;
            }

            // Sweet alert for submit confirmation
            const result = await Swal.fire({
                title: `Are you sure you want to ${isEditMode ? "update" : "create"} this survivor?`,
                icon: "warning",
                showDenyButton: true,
                confirmButtonText: "Yes",
                denyButtonText: "No",
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

            const postRoute = isEditMode
                ? route("survivors.update", survivor.id)
                : route("survivors.store");

            const response = await xios.post(postRoute, {
                ...data,
                _method: isEditMode ? "PUT" : "POST",
            });

            if (response.data.success) {
                toast.success(response.data.message);
                window.location.href = route("survivors.index");
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

    const formatDisabilityOption = (option) => (
        <div className="d-flex align-items-center gap-2">
            <span className="fs-5">{option.icon || "📌"}</span>
            <span>{option.label}</span>
            {option.category && (
                <small className="text-muted ms-2">({option.category})</small>
            )}
        </div>
    );

    // Format options for selects
    const ageBracketOptions = ageRangeOptions || [];
    const idTypeOptions = idTypes || [];
    const genderSelectOptions = genderOptions || [];
    const disabilityTypeOptions =
        disabilityTypes?.map((type) => ({
            value: type.value,
            label: type.label,
            icon: type.icon,
            category: type.category,
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
        multiValue: (base) => ({
            ...base,
            backgroundColor: "#e7f1ff",
            borderRadius: "4px",
        }),
        multiValueLabel: (base) => ({
            ...base,
            display: "flex",
            alignItems: "center",
            gap: "4px",
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
                        icon="👤"
                        description="Complete the following tabs to register a new survivor with confidentiality and care."
                    />
                </Col>
                <Col md={4} className="text-md-end">
                    <Button
                        as={Link}
                        href={route("survivors.index")}
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
                                        className={`rounded-circle bg-${index <= currentTabIndex ? "primary" : "secondary"} bg-opacity-${index <= currentTabIndex ? "100" : "25"} d-flex align-items-center justify-content-center mx-auto mb-2`}
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
                                                    `Please complete ${getTabTitle(tabOrder[currentTabIndex])} first`,
                                                );
                                            }
                                        }}
                                    >
                                        <span
                                            className={`text-${index <= currentTabIndex ? "white" : "secondary"} fw-bold`}
                                        >
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div
                                        className={`small fw-${index === currentTabIndex ? "bold" : "normal"} text-${index === currentTabIndex ? "primary" : "secondary"}`}
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
                        {/* Basic Information Tab */}
                        {activeTab === "basic" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <User
                                            size={20}
                                            className="text-primary"
                                        />
                                        Basic Information
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Enter the basic details of the survivor
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={12} className="mb-4">
                                            <Form.Check
                                                type="switch"
                                                id="anonymous-switch"
                                                label={
                                                    <span>
                                                        Register as anonymous
                                                        (no name will be stored)
                                                        <HelpTooltip
                                                            text="Select this if the survivor prefers to remain anonymous"
                                                            id="anonymous-help"
                                                        />
                                                    </span>
                                                }
                                                checked={data.anonymous}
                                                onChange={(e) => {
                                                    setData(
                                                        "anonymous",
                                                        e.target.checked,
                                                    );
                                                    if (e.target.checked) {
                                                        setData(
                                                            "full_name",
                                                            "",
                                                        );
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        {!data.anonymous && (
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold">
                                                        Full Name{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                        <HelpTooltip
                                                            text="Survivor's full legal name"
                                                            id="name-help"
                                                        />
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={data.full_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                "full_name",
                                                                e.target.value,
                                                            )
                                                        }
                                                        isInvalid={
                                                            !!errors.full_name
                                                        }
                                                        placeholder="Enter full name"
                                                        className="border-2"
                                                    />
                                                    {errors.full_name && (
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.full_name}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        )}

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Phone Number
                                                    <HelpTooltip
                                                        text="Primary contact number for the survivor"
                                                        id="phone-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            "phone",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.phone}
                                                    placeholder="Enter phone number"
                                                    className="border-2"
                                                />
                                                {errors.phone && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Alternate Phone
                                                    <HelpTooltip
                                                        text="Secondary contact number (optional)"
                                                        id="altphone-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={data.alternate_phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            "alternate_phone",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.alternate_phone
                                                    }
                                                    placeholder="Enter alternate phone"
                                                    className="border-2"
                                                />
                                                {errors.alternate_phone && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.alternate_phone}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Gender{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                    <HelpTooltip
                                                        text="Survivor's gender identity"
                                                        id="gender-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={
                                                        genderSelectOptions
                                                    }
                                                    value={
                                                        genderSelectOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                data.gender,
                                                        ) || null
                                                    }
                                                    onChange={(selected) =>
                                                        setData(
                                                            "gender",
                                                            selected
                                                                ? selected.value
                                                                : "",
                                                        )
                                                    }
                                                    isClearable
                                                    placeholder="Select gender"
                                                    styles={selectStyles}
                                                />
                                                {errors.gender && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.gender}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Date of Birth
                                                    <HelpTooltip
                                                        text="Survivor's date of birth"
                                                        id="dob-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={data.dob}
                                                    onChange={(e) =>
                                                        setData(
                                                            "dob",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={!!errors.dob}
                                                    max={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                    className="border-2"
                                                />
                                                {errors.dob && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.dob}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Age Bracket
                                                    <HelpTooltip
                                                        text="Automatically calculated from date of birth"
                                                        id="age-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={ageBracketOptions}
                                                    value={
                                                        ageBracketOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                data.age_bracket,
                                                        ) || null
                                                    }
                                                    onChange={(selected) =>
                                                        setData(
                                                            "age_bracket",
                                                            selected
                                                                ? selected.value
                                                                : "",
                                                        )
                                                    }
                                                    isClearable
                                                    placeholder="Select age bracket"
                                                    styles={selectStyles}
                                                    isDisabled={!!data.dob}
                                                />
                                                {errors.age_bracket && (
                                                    <div className="text-danger small mt-2">
                                                        {errors.age_bracket}
                                                    </div>
                                                )}
                                                <Form.Text className="text-muted">
                                                    Will be auto-calculated if
                                                    DOB is provided
                                                </Form.Text>
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

                        {/* Location Information Tab */}
                        {activeTab === "location" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <MapPin
                                            size={20}
                                            className="text-success"
                                        />
                                        Location Details
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Document the survivor's residence
                                        location
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    County{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                    <HelpTooltip
                                                        text="County where the survivor resides"
                                                        id="county-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={countyOptions}
                                                    value={selectedCounty}
                                                    onChange={onCountyChange}
                                                    isLoading={
                                                        locationLoading?.counties
                                                    }
                                                    isClearable
                                                    placeholder="Select county"
                                                    styles={selectStyles}
                                                    noOptionsMessage={() =>
                                                        "No counties found"
                                                    }
                                                />
                                                {errors.county_id && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.county_id}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Sub County
                                                    <HelpTooltip
                                                        text="Sub-county where the survivor resides"
                                                        id="subcounty-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={subCountyOptions}
                                                    value={selectedSubCounty}
                                                    onChange={onSubCountyChange}
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
                                                    styles={selectStyles}
                                                    noOptionsMessage={() =>
                                                        "No sub-counties found"
                                                    }
                                                />
                                                {errors.sub_county_id && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.sub_county_id}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Ward
                                                    <HelpTooltip
                                                        text="Ward where the survivor resides"
                                                        id="ward-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={wardOptions}
                                                    value={selectedWard}
                                                    onChange={onWardChange}
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
                                                    styles={selectStyles}
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
                                                    <HelpTooltip
                                                        text="Village where the survivor resides"
                                                        id="village-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={villageOptions}
                                                    value={selectedVillage}
                                                    onChange={onVillageChange}
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
                                                    styles={selectStyles}
                                                    noOptionsMessage={() =>
                                                        "No villages found"
                                                    }
                                                />
                                                {errors.village_id && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.village_id}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Landmark
                                                    <HelpTooltip
                                                        text="Nearby landmark to help locate the survivor"
                                                        id="landmark-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.landmark}
                                                    onChange={(e) =>
                                                        setData(
                                                            "landmark",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.landmark
                                                    }
                                                    placeholder="Enter nearby landmark"
                                                    className="border-2"
                                                />
                                                {errors.landmark && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.landmark}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="info" className="mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <MapPin size={20} />
                                            <div>
                                                <strong>
                                                    Location Privacy:
                                                </strong>{" "}
                                                Only collect specific location
                                                details if necessary for case
                                                management and with survivor
                                                consent.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* PWD Information Tab */}
                        {activeTab === "pwd" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <Heart
                                            size={20}
                                            className="text-danger"
                                        />
                                        PWD Information
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Document disability-related information
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={12} className="mb-4">
                                            <Form.Check
                                                type="switch"
                                                id="pwd-switch"
                                                label={
                                                    <span>
                                                        Person with Disability
                                                        (PWD)
                                                        <HelpTooltip
                                                            text="Check if the survivor is a person with disability"
                                                            id="pwd-help"
                                                        />
                                                    </span>
                                                }
                                                checked={data.is_pwd}
                                                onChange={(e) => {
                                                    setData(
                                                        "is_pwd",
                                                        e.target.checked,
                                                    );
                                                    if (!e.target.checked) {
                                                        setData(
                                                            "disability_types",
                                                            [],
                                                        );
                                                        setSelectedDisabilityTypes(
                                                            [],
                                                        );
                                                        setData(
                                                            "pwd_registration_number",
                                                            "",
                                                        );
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    {data.is_pwd && (
                                        <>
                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Type(s) of
                                                            Disability{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                            <HelpTooltip
                                                                text="Select all disability types that apply"
                                                                id="disability-types-help"
                                                            />
                                                        </Form.Label>
                                                        <Select
                                                            options={
                                                                disabilityTypeOptions
                                                            }
                                                            value={
                                                                selectedDisabilityTypes
                                                            }
                                                            onChange={
                                                                handleDisabilityTypesChange
                                                            }
                                                            formatOptionLabel={
                                                                formatDisabilityOption
                                                            }
                                                            isMulti
                                                            isClearable
                                                            placeholder="Select disability type(s)..."
                                                            styles={
                                                                selectStyles
                                                            }
                                                            noOptionsMessage={() =>
                                                                "No disability types found"
                                                            }
                                                        />
                                                        {errors.disability_types && (
                                                            <div className="text-danger small mt-1">
                                                                {
                                                                    errors.disability_types
                                                                }
                                                            </div>
                                                        )}
                                                        <Form.Text className="text-muted">
                                                            You can select
                                                            multiple disability
                                                            types
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className="fw-semibold">
                                                            Registration Number
                                                            <HelpTooltip
                                                                text="PWD registration number (if available)"
                                                                id="pwd-reg-help"
                                                            />
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={
                                                                data.pwd_registration_number
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    "pwd_registration_number",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            isInvalid={
                                                                !!errors.pwd_registration_number
                                                            }
                                                            placeholder="Enter registration number"
                                                            className="border-2"
                                                        />
                                                        {errors.pwd_registration_number && (
                                                            <Form.Control.Feedback type="invalid">
                                                                {
                                                                    errors.pwd_registration_number
                                                                }
                                                            </Form.Control.Feedback>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {selectedDisabilityTypes.length >
                                                0 && (
                                                <Card className="bg-light border-0 mt-3">
                                                    <Card.Body>
                                                        <h6 className="fw-semibold mb-2">
                                                            Selected Disability
                                                            Types:
                                                        </h6>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {selectedDisabilityTypes.map(
                                                                (type) => (
                                                                    <span
                                                                        key={
                                                                            type.value
                                                                        }
                                                                        className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                                                                    >
                                                                        <span className="fs-6">
                                                                            {type.icon ||
                                                                                "📌"}
                                                                        </span>
                                                                        {
                                                                            type.label
                                                                        }
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            )}
                                        </>
                                    )}

                                    <Alert variant="warning" className="mt-3">
                                        <div className="d-flex gap-2">
                                            <AlertCircle
                                                size={16}
                                                className="flex-shrink-0 mt-1"
                                            />
                                            <div>
                                                <strong>
                                                    Accessibility Needs:
                                                </strong>{" "}
                                                Document any specific
                                                accommodations or accessibility
                                                requirements to ensure
                                                appropriate support services.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Identification Tab */}
                        {activeTab === "identification" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <IdCard
                                            size={20}
                                            className="text-info"
                                        />
                                        Identification
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Government-issued identification details
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    ID Type
                                                    <HelpTooltip
                                                        text="Type of government-issued identification"
                                                        id="idtype-help"
                                                    />
                                                </Form.Label>
                                                <Select
                                                    options={idTypeOptions}
                                                    value={
                                                        idTypeOptions.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                data.id_type,
                                                        ) || null
                                                    }
                                                    onChange={(selected) =>
                                                        setData(
                                                            "id_type",
                                                            selected
                                                                ? selected.value
                                                                : "",
                                                        )
                                                    }
                                                    isClearable
                                                    placeholder="Select ID type"
                                                    styles={selectStyles}
                                                />
                                                {errors.id_type && (
                                                    <div className="text-danger small mt-1">
                                                        {errors.id_type}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    ID Number
                                                    <HelpTooltip
                                                        text="Identification number"
                                                        id="idnumber-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={data.id_number}
                                                    onChange={(e) =>
                                                        setData(
                                                            "id_number",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.id_number
                                                    }
                                                    placeholder="Enter ID number"
                                                    className="border-2"
                                                />
                                                {errors.id_number && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.id_number}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="info" className="mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <IdCard size={20} />
                                            <div>
                                                <strong>
                                                    Data Protection:
                                                </strong>{" "}
                                                Identification documents are
                                                stored securely and access is
                                                restricted to authorized
                                                personnel only.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Emergency Contact Tab */}
                        {activeTab === "emergency" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <Phone
                                            size={20}
                                            className="text-warning"
                                        />
                                        Emergency Contact
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Person to contact in case of emergency
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Row>
                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Contact Name
                                                    <HelpTooltip
                                                        text="Full name of emergency contact person"
                                                        id="emergency-name-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        data.emergency_contact_name
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "emergency_contact_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.emergency_contact_name
                                                    }
                                                    placeholder="Enter contact name"
                                                    className="border-2"
                                                />
                                                {errors.emergency_contact_name && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.emergency_contact_name
                                                        }
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Contact Phone
                                                    <HelpTooltip
                                                        text="Phone number of emergency contact"
                                                        id="emergency-phone-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    value={
                                                        data.emergency_contact_phone
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "emergency_contact_phone",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.emergency_contact_phone
                                                    }
                                                    placeholder="Enter contact phone"
                                                    className="border-2"
                                                />
                                                {errors.emergency_contact_phone && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.emergency_contact_phone
                                                        }
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={4} className="mb-3">
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    Relationship
                                                    <HelpTooltip
                                                        text="Relationship to the survivor"
                                                        id="emergency-relation-help"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        data.emergency_contact_relation
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "emergency_contact_relation",
                                                            e.target.value,
                                                        )
                                                    }
                                                    isInvalid={
                                                        !!errors.emergency_contact_relation
                                                    }
                                                    placeholder="e.g., Spouse, Parent"
                                                    className="border-2"
                                                />
                                                {errors.emergency_contact_relation && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {
                                                            errors.emergency_contact_relation
                                                        }
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Alert variant="info" className="mt-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <Phone size={20} />
                                            <div>
                                                <strong>Safety First:</strong>{" "}
                                                Only collect emergency contact
                                                information with survivor's
                                                consent and ensure contact
                                                person is aware and willing to
                                                be contacted.
                                            </div>
                                        </div>
                                    </Alert>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Consent & Confidentiality Tab */}
                        {activeTab === "consent" && (
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <h4 className="mb-0 d-flex align-items-center gap-2">
                                        <Shield
                                            size={20}
                                            className="text-primary"
                                        />
                                        Consent & Confidentiality
                                    </h4>
                                    <p className="text-muted small mt-1">
                                        Document consent and confidentiality
                                        agreements
                                    </p>
                                </Card.Header>
                                <Card.Body className="pt-3">
                                    <Form.Check
                                        type="switch"
                                        id="consent-switch"
                                        label={
                                            <span>
                                                I confirm that the survivor has
                                                given informed consent for their
                                                information to be stored and
                                                used for case management
                                                purposes.{" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                                <HelpTooltip
                                                    text="Required: Informed consent must be obtained before registering a survivor"
                                                    id="consent-help"
                                                />
                                            </span>
                                        }
                                        checked={data.consent_given}
                                        onChange={(e) =>
                                            setData(
                                                "consent_given",
                                                e.target.checked,
                                            )
                                        }
                                        className="mb-4"
                                    />

                                    {errors.consent_given && (
                                        <div className="text-danger small mt-2 mb-3">
                                            {errors.consent_given}
                                        </div>
                                    )}

                                    <Card className="bg-light border-0 mt-3">
                                        <Card.Body>
                                            <h6 className="fw-semibold mb-3">
                                                Consent Includes:
                                            </h6>
                                            <ul className="text-muted small mb-0">
                                                <li className="mb-2">
                                                    Storage of personal
                                                    information in the secure
                                                    database
                                                </li>
                                                <li className="mb-2">
                                                    Sharing information with
                                                    relevant service providers
                                                    for referrals
                                                </li>
                                                <li className="mb-2">
                                                    Using anonymized data for
                                                    reporting and statistics
                                                </li>
                                                <li className="mb-2">
                                                    Contacting the survivor for
                                                    follow-up services
                                                </li>
                                            </ul>
                                        </Card.Body>
                                    </Card>

                                    <Alert variant="warning" className="mt-4">
                                        <div className="d-flex gap-2">
                                            <Shield size={20} />
                                            <div>
                                                <strong>
                                                    Rights of Survivor:
                                                </strong>{" "}
                                                The survivor has the right to
                                                withdraw consent at any time.
                                                All information will be handled
                                                according to data protection
                                                laws and GBV guidelines.
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
                                    href={route("survivors.index")}
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
                                                : "Registering..."
                                            : isEditMode
                                              ? "Update Survivor"
                                              : "Register Survivor"}
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
