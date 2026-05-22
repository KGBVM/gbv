import { Head, Link, useForm } from "@inertiajs/react";
import {
    Form,
    Button,
    Alert,
    Spinner,
    InputGroup,
    ProgressBar,
} from "react-bootstrap";
import {
    Envelope,
    Lock,
    Shield,
    Eye,
    EyeSlash,
    CheckCircle,
} from "react-bootstrap-icons";
import GuestLayout from "@/Layouts/GuestLayout";
import { useState } from "react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = data.password;
        if (!password)
            return { strength: 0, text: "No password", variant: "secondary" };
        if (password.length < 6)
            return { strength: 25, text: "Too short", variant: "danger" };
        if (password.length < 8)
            return { strength: 50, text: "Weak", variant: "warning" };
        if (
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        ) {
            return { strength: 100, text: "Strong", variant: "success" };
        }
        if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 75, text: "Good", variant: "info" };
        }
        return { strength: 50, text: "Fair", variant: "warning" };
    };

    const strength = getPasswordStrength();

    return (
        <GuestLayout>
            <Head title="Reset Password - GBV Portal" />

            {/* Header */}
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Create New Password</h4>
                <p className="text-secondary small">
                    Kitui County GBV Information System
                </p>
            </div>

            {/* Info Message */}
            <Alert
                variant="info"
                className="mb-4 small d-flex align-items-center gap-2"
            >
                <Shield className="flex-shrink-0" size={16} />
                <span>
                    <strong>Password Requirements:</strong> Minimum 8 characters
                    with at least one uppercase letter, one number, and one
                    special character.
                </span>
            </Alert>

            <Form onSubmit={submit}>
                {/* Email Field (read-only) */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                        <Envelope className="me-1" size={12} />
                        Email Address
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light">
                            <Envelope size={16} className="text-secondary" />
                        </InputGroup.Text>
                        <Form.Control
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="gv.officer@kitui.go.ke"
                            autoComplete="username"
                            readOnly={!!email}
                            isInvalid={!!errors.email}
                        />
                    </InputGroup>
                    {errors.email && (
                        <Form.Text className="text-danger small mt-1 d-block">
                            {errors.email}
                        </Form.Text>
                    )}
                </Form.Group>

                {/* New Password Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                        <Lock className="me-1" size={12} />
                        New Password
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light">
                            <Lock size={16} className="text-secondary" />
                        </InputGroup.Text>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            autoFocus
                            isInvalid={!!errors.password}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlash size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </Button>
                    </InputGroup>

                    {/* Password Strength Indicator */}
                    {data.password && (
                        <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <Form.Text className="text-secondary">
                                    Password strength:
                                </Form.Text>
                                <Form.Text
                                    className={`text-${strength.variant} fw-semibold`}
                                >
                                    {strength.text}
                                </Form.Text>
                            </div>
                            <ProgressBar
                                now={strength.strength}
                                variant={strength.variant}
                                style={{ height: "4px" }}
                            />
                        </div>
                    )}

                    {errors.password && (
                        <Form.Text className="text-danger small mt-1 d-block">
                            {errors.password}
                        </Form.Text>
                    )}
                </Form.Group>

                {/* Confirm Password Field */}
                <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">
                        <CheckCircle className="me-1" size={12} />
                        Confirm New Password
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light">
                            <Lock size={16} className="text-secondary" />
                        </InputGroup.Text>
                        <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            isInvalid={!!errors.password_confirmation}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeSlash size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </Button>
                    </InputGroup>
                    {errors.password_confirmation && (
                        <Form.Text className="text-danger small mt-1 d-block">
                            {errors.password_confirmation}
                        </Form.Text>
                    )}

                    {/* Password Match Indicator */}
                    {data.password && data.password_confirmation && (
                        <div className="mt-2 small">
                            {data.password === data.password_confirmation ? (
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

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2 mb-3 rounded-pill fw-semibold"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Resetting password...
                        </>
                    ) : (
                        <>
                            <Shield className="me-2" size={16} />
                            Reset Password
                        </>
                    )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href={route("login")}
                        className="small text-primary text-decoration-none"
                    >
                        Return to Login
                    </Link>
                </div>
            </Form>

            {/* Help Section */}
            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-secondary mb-2">
                    Having trouble resetting your password?
                </p>
                <div className="d-flex justify-content-center gap-3">
                    <Link
                        href="/contact"
                        className="small text-primary text-decoration-none"
                    >
                        Contact Support
                    </Link>
                    <span className="text-secondary">•</span>
                    <Link
                        href="/help"
                        className="small text-primary text-decoration-none"
                    >
                        Help Center
                    </Link>
                </div>
            </div>

            {/* Security Notice */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                <div
                    className="bg-success rounded-circle"
                    style={{ width: "6px", height: "6px" }}
                />
                <span className="small text-secondary">
                    256-bit encrypted password reset
                </span>
            </div>
        </GuestLayout>
    );
}
