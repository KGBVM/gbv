// Resources/js/Pages/Auth/Register.jsx
import { Head, Link } from "@inertiajs/react";
import {
    Form,
    Button,
    Alert,
    Spinner,
    InputGroup,
    Row,
    Col,
    Badge,
    Card,
} from "react-bootstrap";
import {
    Person,
    Envelope,
    Lock,
    Shield,
    Eye,
    EyeSlash,
    Building,
    GeoAlt,
    Telephone,
    CheckCircle,
    InfoCircle,
    Briefcase,
    FileText,
    Hash,
} from "react-bootstrap-icons";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { useErrorToast } from "@/hooks/useErrorToast";

import GuestLayout from "@/Layouts/GuestLayout";
import xios from "@/Utils/xios";
import Select from "react-select";
import useData from "@/hooks/useData";

export default function Register() {
    const [formData, setFormData] = useState({
        organization_name: "",
        organization_type_id: "",
        registration_number: "",
        year_established: "",
        contact_person: "",
        contact_person_title_id: "",
        email: "",
        phone: "",
        alternate_phone: "",
        address: "",
        city: "",
        county_id: "",
        postal_code: "",
        password: "",
        password_confirmation: "",
        website: "",
        description: "",
        service_area_id: "",
        terms_accepted: false,
        data_sharing_consent: false,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [serverError, setServerError] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const { showErrorToast } = useErrorToast();

    // Use the custom hook for data fetching
    const {
        organizationTypes,
        counties,
        isLoading,
        error: dataError,
        refetch: refetchData,
        locationLoading,
        handleCountyChange,
    } = useData();

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setServerError(null);
        setErrors({});

        try {
            const response = await xios.post(
                route("partner.register"),
                formData,
            );

            if (response.data.success) {
                setRegistrationSuccess(true);
                // redirect to login after 5 sec
                setTimeout(() => {
                    window.location.href = route("login");
                }, 5000);
            } else {
                showErrorToast(response.data.message);
            }
        } catch (error) {
            showErrorToast(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateStep = useCallback(
        (step) => {
            switch (step) {
                case 1:
                    if (
                        !formData.organization_name ||
                        !formData.organization_type_id
                    ) {
                        return false;
                    }
                    return true;
                case 2:
                    if (
                        !formData.contact_person ||
                        !formData.email ||
                        !formData.phone
                    ) {
                        return false;
                    }
                    return true;
                case 3:
                    if (
                        !formData.password ||
                        !formData.password_confirmation ||
                        !formData.terms_accepted
                    ) {
                        return false;
                    }
                    if (formData.password !== formData.password_confirmation) {
                        setErrors((prev) => ({
                            ...prev,
                            password_confirmation: "Passwords do not match",
                        }));
                        return false;
                    }
                    return true;
                default:
                    return true;
            }
        },
        [formData],
    );

    const nextStep = useCallback(() => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, validateStep]);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => prev - 1);
    }, []);

    const getPasswordStrength = useCallback(() => {
        const password = formData.password;
        if (!password)
            return { strength: 0, text: "No password", variant: "secondary" };

        let score = 0;
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 10;
        if (/[A-Z]/.test(password)) score += 20;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;

        score = Math.min(100, score);

        if (score < 40)
            return { strength: score, text: "Weak", variant: "danger" };
        if (score < 70)
            return { strength: score, text: "Fair", variant: "warning" };
        if (score < 90)
            return { strength: score, text: "Good", variant: "info" };
        return { strength: score, text: "Strong", variant: "success" };
    }, [formData.password]);

    const strength = useMemo(
        () => getPasswordStrength(),
        [getPasswordStrength],
    );

    // Transform data for Select components
    const organizationTypeOptions = useMemo(
        () =>
            organizationTypes.map((type) => ({
                value: type.id,
                label: type.name,
                icon: type.icon,
            })),
        [organizationTypes],
    );

    const countyOptions = useMemo(
        () =>
            counties.map((county) => ({
                value: county.id,
                label: county.name,
            })),
        [counties],
    );

    // Handle county selection with the hook's handler
    const handleCountySelect = useCallback(
        (selected) => {
            handleInputChange("county_id", selected?.value || "");
            // Use the hook's county change handler if needed for cascading
            if (selected) {
                handleCountyChange(selected);
            }
        },
        [handleCountyChange],
    );

    if (registrationSuccess) {
        return (
            <GuestLayout>
                <Card className="border-0 shadow-sm text-center p-5">
                    <div className="mb-4">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mx-auto mb-3">
                            <CheckCircle size={48} className="text-success" />
                        </div>
                        <h4 className="fw-bold mb-2">
                            Registration Successful!
                        </h4>
                        <p className="text-secondary">
                            Thank you for registering. You will be redirected to
                            the login page...
                        </p>
                        <Spinner
                            animation="border"
                            variant="success"
                            size="sm"
                            className="mt-3"
                        />
                    </div>
                </Card>
            </GuestLayout>
        );
    }

    if (isLoading) {
        return (
            <GuestLayout>
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading registration form...</p>
                </div>
            </GuestLayout>
        );
    }

    if (dataError) {
        return (
            <GuestLayout>
                <Alert variant="danger" className="m-4">
                    <Alert.Heading>Error Loading Data</Alert.Heading>
                    <p>{dataError}</p>
                    <Button variant="outline-danger" onClick={refetchData}>
                        Retry
                    </Button>
                </Alert>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Partner Registration - GBV Portal" />

            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Agency & Partner Registration</h4>
                <p className="text-secondary small">
                    Join Kitui County GBV Information System as a Partner
                    Agency/Organization
                </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
                <Alert
                    variant="danger"
                    className="mb-4"
                    onClose={() => setServerError(null)}
                    dismissible
                >
                    <Alert.Heading className="fs-6">
                        Registration Failed
                    </Alert.Heading>
                    <p className="mb-0 small">{serverError}</p>
                </Alert>
            )}

            {/* Progress Steps */}
            <Card className="border-0 bg-light mb-4 p-3">
                <div className="d-flex justify-content-between align-items-center">
                    {[
                        {
                            step: 1,
                            label: "Organization",
                            icon: <Building size={18} />,
                        },
                        {
                            step: 2,
                            label: "Contact & Address",
                            icon: <Telephone size={18} />,
                        },
                        {
                            step: 3,
                            label: "Account Setup",
                            icon: <Lock size={18} />,
                        },
                    ].map((item) => (
                        <div
                            key={item.step}
                            className="d-flex flex-column align-items-center flex-grow-1"
                        >
                            <Badge
                                bg={
                                    currentStep >= item.step
                                        ? "primary"
                                        : "secondary"
                                }
                                className={`rounded-circle p-2 mb-2 d-flex align-items-center justify-content-center ${
                                    currentStep >= item.step
                                        ? ""
                                        : "bg-opacity-25"
                                }`}
                                style={{ width: "40px", height: "40px" }}
                            >
                                {currentStep > item.step ? (
                                    <CheckCircle size={18} />
                                ) : (
                                    item.step
                                )}
                            </Badge>
                            <span
                                className={`small ${
                                    currentStep >= item.step
                                        ? "text-primary fw-semibold"
                                        : "text-secondary"
                                }`}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="progress mt-3" style={{ height: "4px" }}>
                    <div
                        className="progress-bar bg-primary"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={(currentStep / 3) * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    />
                </div>
            </Card>

            <Alert
                variant="info"
                className="mb-4 small d-flex align-items-center gap-2"
            >
                <Shield className="text-info flex-shrink-0" size={16} />
                <span>
                    <strong>Partner Registration:</strong> All agencies must be
                    registered with relevant authorities and comply with GBV
                    data protection guidelines.
                </span>
            </Alert>

            <Form onSubmit={submit}>
                {/* Step 1: Organization Information */}
                {currentStep === 1 && (
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-1">
                                    <Building
                                        className="me-2 text-primary"
                                        size={20}
                                    />
                                    Organization Details
                                </h5>
                                <p className="text-secondary small">
                                    Basic information about your agency
                                </p>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-secondary">
                                    Organization/Agency Name *
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light">
                                        <Building
                                            size={16}
                                            className="text-secondary"
                                        />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        value={formData.organization_name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "organization_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Kitui County Referral Hospital"
                                        isInvalid={!!errors.organization_name}
                                        required
                                    />
                                </InputGroup>
                                <Form.Control.Feedback
                                    type="invalid"
                                    className="d-block small mt-1"
                                >
                                    {errors.organization_name}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-secondary">
                                    <Briefcase className="me-1" size={12} />
                                    Agency/Organization Type *
                                </Form.Label>
                                <Select
                                    options={organizationTypeOptions}
                                    value={organizationTypeOptions.find(
                                        (opt) =>
                                            opt.value ===
                                            formData.organization_type_id,
                                    )}
                                    onChange={(selected) =>
                                        handleInputChange(
                                            "organization_type_id",
                                            selected?.value || "",
                                        )
                                    }
                                    placeholder="Select organization type..."
                                    formatOptionLabel={({ label, icon }) => (
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-secondary">
                                                {icon}
                                            </span>
                                            <span>{label}</span>
                                        </div>
                                    )}
                                    classNamePrefix="react-select"
                                />
                                {errors.organization_type_id && (
                                    <div className="small text-danger mt-1">
                                        {errors.organization_type_id}
                                    </div>
                                )}
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <Hash className="me-1" size={12} />
                                            Registration/License Number
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.registration_number}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "registration_number",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., HOSP/2024/123"
                                            isInvalid={
                                                !!errors.registration_number
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <InfoCircle
                                                className="me-1"
                                                size={12}
                                            />
                                            Year Established
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={formData.year_established}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "year_established",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., 2010"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-secondary">
                                    <FileText className="me-1" size={12} />
                                    Agency Description & Services
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Briefly describe your agency's mission, GBV services offered, and target population"
                                    maxLength={500}
                                />
                                <Form.Text className="text-muted small">
                                    {formData.description.length}/500 characters
                                </Form.Text>
                            </Form.Group>

                            <div className="d-flex justify-content-end mt-4">
                                <Button
                                    variant="primary"
                                    onClick={nextStep}
                                    className="px-4 rounded-pill"
                                >
                                    Next: Contact Information →
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Step 2: Contact Information */}
                {currentStep === 2 && (
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-1">
                                    <Telephone
                                        className="me-2 text-primary"
                                        size={20}
                                    />
                                    Contact & Location Details
                                </h5>
                                <p className="text-secondary small">
                                    Primary contact and physical address
                                    information
                                </p>
                            </div>

                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <Person
                                                className="me-1"
                                                size={12}
                                            />
                                            Contact Person Full Name *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.contact_person}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "contact_person",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Full name of primary contact"
                                            isInvalid={!!errors.contact_person}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <Envelope
                                                className="me-1"
                                                size={12}
                                            />
                                            Email Address *
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="contact@agency.org"
                                            autoComplete="username"
                                            isInvalid={!!errors.email}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <Telephone
                                                className="me-1"
                                                size={12}
                                            />
                                            Primary Phone Number *
                                        </Form.Label>
                                        <Form.Control
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0712345678"
                                            isInvalid={!!errors.phone}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <h6 className="fw-semibold mb-3">
                                <GeoAlt
                                    className="me-2 text-primary"
                                    size={18}
                                />
                                Physical Address
                            </h6>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-secondary">
                                    Street/Building Address
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "address",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., Kenyatta Avenue, Suite 45, Kitui Town"
                                />
                            </Form.Group>

                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            City/Town
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "city",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Kitui"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            County
                                        </Form.Label>
                                        <Select
                                            options={countyOptions}
                                            value={countyOptions.find(
                                                (opt) =>
                                                    opt.value ===
                                                    formData.county_id,
                                            )}
                                            onChange={handleCountySelect}
                                            placeholder="Select County"
                                            isLoading={locationLoading.counties}
                                            classNamePrefix="react-select"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Postal Code
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.postal_code}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "postal_code",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., 90200"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={prevStep}
                                    className="px-4 rounded-pill"
                                >
                                    ← Previous
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={nextStep}
                                    className="px-4 rounded-pill"
                                >
                                    Next: Account Setup →
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Step 3: Account Information */}
                {currentStep === 3 && (
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <h5 className="fw-semibold mb-1">
                                    <Lock
                                        className="me-2 text-primary"
                                        size={20}
                                    />
                                    Account Security
                                </h5>
                                <p className="text-secondary small">
                                    Create your login credentials
                                </p>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold text-secondary">
                                    <Lock className="me-1" size={12} />
                                    Password *
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Create a strong password"
                                        autoComplete="new-password"
                                        isInvalid={!!errors.password}
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        type="button"
                                    >
                                        {showPassword ? (
                                            <EyeSlash size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </Button>
                                </InputGroup>

                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small text-secondary">
                                                Password strength:
                                            </span>
                                            <span
                                                className={`small text-${strength.variant} fw-semibold`}
                                            >
                                                {strength.text}
                                            </span>
                                        </div>
                                        <div
                                            className="progress"
                                            style={{ height: "4px" }}
                                        >
                                            <div
                                                className={`progress-bar bg-${strength.variant}`}
                                                style={{
                                                    width: `${strength.strength}%`,
                                                }}
                                                role="progressbar"
                                                aria-valuenow={
                                                    strength.strength
                                                }
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            />
                                        </div>
                                    </div>
                                )}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-semibold text-secondary">
                                    <CheckCircle className="me-1" size={12} />
                                    Confirm Password *
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.password_confirmation}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        isInvalid={
                                            !!errors.password_confirmation
                                        }
                                        required
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        type="button"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlash size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </Button>
                                </InputGroup>
                                {formData.password &&
                                    formData.password_confirmation && (
                                        <div className="mt-2 small">
                                            {formData.password ===
                                            formData.password_confirmation ? (
                                                <span className="text-success">
                                                    ✓ Passwords match
                                                </span>
                                            ) : (
                                                <span className="text-danger">
                                                    ✗ Passwords do not match
                                                </span>
                                            )}
                                        </div>
                                    )}
                            </Form.Group>

                            <div className="mb-4">
                                <h6 className="fw-semibold mb-3">
                                    <Shield
                                        className="me-2 text-primary"
                                        size={18}
                                    />
                                    Terms and Agreements
                                </h6>

                                <Card className="bg-light border-0 mb-3">
                                    <Card.Body className="p-3">
                                        <Form.Check className="mb-2">
                                            <Form.Check.Input
                                                type="checkbox"
                                                checked={
                                                    formData.terms_accepted
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "terms_accepted",
                                                        e.target.checked,
                                                    )
                                                }
                                                isInvalid={
                                                    !!errors.terms_accepted
                                                }
                                                required
                                            />
                                            <Form.Check.Label className="small">
                                                I agree to the{" "}
                                                <Link
                                                    href="/terms"
                                                    className="text-primary"
                                                >
                                                    Terms of Service
                                                </Link>{" "}
                                                and{" "}
                                                <Link
                                                    href="/privacy"
                                                    className="text-primary"
                                                >
                                                    Privacy Policy
                                                </Link>{" "}
                                                *
                                            </Form.Check.Label>
                                        </Form.Check>

                                        <Form.Check>
                                            <Form.Check.Input
                                                type="checkbox"
                                                checked={
                                                    formData.data_sharing_consent
                                                }
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "data_sharing_consent",
                                                        e.target.checked,
                                                    )
                                                }
                                            />
                                            <Form.Check.Label className="small">
                                                I consent to sharing agency data
                                                with Kitui County for GBV
                                                coordination purposes
                                            </Form.Check.Label>
                                        </Form.Check>
                                    </Card.Body>
                                </Card>
                            </div>

                            <Alert variant="warning" className="mb-4 small">
                                <Shield className="me-2" size={16} />
                                <strong>Important:</strong> By registering, you
                                confirm that your agency follows GBV data
                                protection guidelines and ethical standards.
                            </Alert>

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="outline-secondary"
                                    onClick={prevStep}
                                    className="px-4 rounded-pill"
                                >
                                    ← Previous
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="px-4 rounded-pill fw-semibold"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Spinner
                                                animation="border"
                                                size="sm"
                                                className="me-2"
                                            />
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Shield
                                                className="me-2"
                                                size={16}
                                            />
                                            Complete Registration
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </Form>

            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-secondary mb-2">
                    Already have a partner account?
                </p>
                <Link
                    href={route("login")}
                    className="small text-primary text-decoration-none fw-semibold"
                >
                    Sign In to Your Account
                </Link>
            </div>
        </GuestLayout>
    );
}
