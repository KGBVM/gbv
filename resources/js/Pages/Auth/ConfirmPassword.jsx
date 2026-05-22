import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { Lock, Shield, Eye, EyeSlash, ArrowLeft } from "react-bootstrap-icons";
import GuestLayout from "@/Layouts/GuestLayout";
import { useState } from "react";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password - GBV Portal" />

            {/* Header */}
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Confirm Your Password</h4>
                <p className="text-secondary small">
                    Kitui County GBV Information System
                </p>
            </div>

            {/* Security Alert */}
            <Alert
                variant="warning"
                className="mb-4 d-flex align-items-center gap-2"
            >
                <Shield className="flex-shrink-0" size={16} />
                <span className="small">
                    <strong>Secure Area:</strong> This is a protected section of
                    the application. Please confirm your password before
                    continuing.
                </span>
            </Alert>

            <Form onSubmit={submit}>
                {/* Password Field */}
                <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-secondary">
                        <Lock className="me-1" size={12} />
                        Password
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
                            placeholder="Enter your password"
                            autoComplete="current-password"
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
                    {errors.password && (
                        <Form.Text className="text-danger small mt-1 d-block">
                            {errors.password}
                        </Form.Text>
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
                            Verifying...
                        </>
                    ) : (
                        <>
                            <Shield className="me-2" size={16} />
                            Confirm Password
                        </>
                    )}
                </Button>

                {/* Back to Dashboard Link */}
                <div className="text-center">
                    <Link
                        href={route("dashboard")}
                        className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                    >
                        <ArrowLeft size={14} />
                        Back to Dashboard
                    </Link>
                </div>
            </Form>

            {/* Help Section */}
            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-secondary mb-2">
                    Forgot your password?
                </p>
                <div className="d-flex justify-content-center gap-3">
                    <Link
                        href={route("password.request")}
                        className="small text-primary text-decoration-none"
                    >
                        Reset Password
                    </Link>
                    <span className="text-secondary">•</span>
                    <Link
                        href="/contact"
                        className="small text-primary text-decoration-none"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>

            {/* Security Status */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                <div
                    className="bg-success rounded-circle"
                    style={{ width: "6px", height: "6px" }}
                />
                <span className="small text-secondary">
                    Session security verification required
                </span>
            </div>
        </GuestLayout>
    );
}
