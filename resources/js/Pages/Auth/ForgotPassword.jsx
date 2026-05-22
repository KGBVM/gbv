import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { Envelope, Shield, ArrowLeft } from "react-bootstrap-icons";
import GuestLayout from "@/Layouts/GuestLayout";
import { useState } from "react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"), {
            onSuccess: () => setIsSubmitted(true),
        });
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password - GBV Portal" />

            {/* Header */}
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Reset Password</h4>
                <p className="text-secondary small">
                    Kitui County GBV Information System
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <Alert
                    variant="success"
                    className="mb-4 d-flex align-items-center gap-2"
                >
                    <Shield className="flex-shrink-0" size={16} />
                    <span>{status}</span>
                </Alert>
            )}

            {/* Success Message */}
            {isSubmitted && !errors.email && (
                <Alert
                    variant="success"
                    className="mb-4 d-flex align-items-center gap-2"
                >
                    <Shield className="flex-shrink-0" size={16} />
                    <span>
                        We have emailed your password reset link! Please check
                        your inbox.
                    </span>
                </Alert>
            )}

            {/* Info Message */}
            <Alert
                variant="info"
                className="mb-4 small d-flex align-items-center gap-2"
            >
                <Shield className="flex-shrink-0" size={16} />
                <span>
                    <strong>Security Notice:</strong> Enter your registered
                    email address and we'll send you a secure password reset
                    link.
                </span>
            </Alert>

            <Form onSubmit={submit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
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
                            autoFocus
                            isInvalid={!!errors.email}
                        />
                    </InputGroup>
                    {errors.email && (
                        <Form.Text className="text-danger small mt-1 d-block">
                            {errors.email}
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
                            Sending reset link...
                        </>
                    ) : (
                        <>
                            <Shield className="me-2" size={16} />
                            Send Password Reset Link
                        </>
                    )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href={route("login")}
                        className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                    >
                        <ArrowLeft size={14} />
                        Back to Login
                    </Link>
                </div>
            </Form>

            {/* Help Section */}
            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-secondary mb-2">
                    Need immediate assistance?
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
                    Secure password reset process
                </span>
            </div>
        </GuestLayout>
    );
}
