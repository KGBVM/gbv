import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { Envelope, Lock, Shield, Eye, EyeSlash } from "react-bootstrap-icons";
import GuestLayout from "@/Layouts/GuestLayout";
import { useState } from "react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in - GBV Portal" />

            {/* Header */}
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Welcome Back</h4>
                <p className="text-secondary small">
                    Secure access to Kitui County GBV Information System
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

            <Form onSubmit={submit}>
                {/* Email Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                        <Envelope className="me-1" size={12} />
                        Email Address
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                            <Envelope size={16} className="text-secondary" />
                        </InputGroup.Text>
                        <Form.Control
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="border-start-0 bg-light"
                            placeholder="gv.officer@kitui.go.ke"
                            autoComplete="username"
                            autoFocus
                            isInvalid={!!errors.email}
                        />
                    </InputGroup>
                    {errors.email && (
                        <Form.Control.Feedback
                            type="invalid"
                            className="d-block small mt-1"
                        >
                            {errors.email}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-secondary">
                        <Lock className="me-1" size={12} />
                        Password
                    </Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                            <Lock size={16} className="text-secondary" />
                        </InputGroup.Text>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="border-start-0 bg-light"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            isInvalid={!!errors.password}
                        />
                        <Button
                            variant="link"
                            className="bg-light border text-secondary text-decoration-none"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ zIndex: 5 }}
                        >
                            {showPassword ? (
                                <EyeSlash size={16} />
                            ) : (
                                <Eye size={16} />
                            )}
                        </Button>
                    </InputGroup>
                    {errors.password && (
                        <Form.Control.Feedback
                            type="invalid"
                            className="d-block small mt-1"
                        >
                            {errors.password}
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check type="checkbox">
                        <Form.Check.Input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="me-2"
                        />
                        <Form.Check.Label className="small text-secondary">
                            Remember this device
                        </Form.Check.Label>
                    </Form.Check>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="small text-primary text-decoration-none"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

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
                            Verifying credentials...
                        </>
                    ) : (
                        <>
                            <Lock className="me-2" size={16} />
                            Secure Login
                        </>
                    )}
                </Button>

                {/* Security Notice */}
                <div className="text-center small text-secondary">
                    <Shield className="me-1" size={12} />
                    Protected by 256-bit encryption & MFA
                </div>
            </Form>
        </GuestLayout>
    );
}
