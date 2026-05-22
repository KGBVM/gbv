import { Head, Link, useForm } from "@inertiajs/react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import {
    Envelope,
    Shield,
    CheckCircle,
    BoxArrowRight,
} from "react-bootstrap-icons";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification - GBV Portal" />

            {/* Header */}
            <div className="text-center mb-4">
                <h4 className="fw-bold mb-2">Verify Your Email</h4>
                <p className="text-secondary small">
                    Kitui County GBV Information System
                </p>
            </div>

            {/* Welcome Message */}
            <Alert
                variant="success"
                className="mb-4 d-flex align-items-center gap-2"
            >
                <CheckCircle className="flex-shrink-0" size={16} />
                <span>
                    <strong>Welcome!</strong> Your account has been created
                    successfully.
                </span>
            </Alert>

            {/* Status Message */}
            {status === "verification-link-sent" && (
                <Alert
                    variant="success"
                    className="mb-4 d-flex align-items-center gap-2"
                >
                    <Envelope className="flex-shrink-0" size={16} />
                    <span>
                        A new verification link has been sent to your email
                        address.
                    </span>
                </Alert>
            )}

            {/* Info Message */}
            <Alert
                variant="info"
                className="mb-4 small d-flex align-items-center gap-2 bg-info bg-opacity-10 border-info border-opacity-25"
            >
                <Shield className="text-info flex-shrink-0" size={16} />
                <span>
                    <strong>Almost there!</strong> Please verify your email
                    address to activate your account and access all features.
                </span>
            </Alert>

            {/* Instructions */}
            <div className="text-center mb-4">
                <div className="bg-light p-4 rounded-3">
                    <Envelope size={32} className="text-primary mb-3" />
                    <p className="text-secondary mb-2 small">
                        Thanks for signing up! Before getting started, could you
                        verify your email address by clicking on the link we
                        just emailed to you?
                    </p>
                    <p className="text-secondary small mb-0">
                        If you didn't receive the email, we'll gladly send you
                        another.
                    </p>
                </div>
            </div>

            <Form onSubmit={submit}>
                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-grow-1 py-2 rounded-pill fw-semibold"
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
                                Sending...
                            </>
                        ) : (
                            <>
                                <Envelope className="me-2" size={16} />
                                Resend Verification Email
                            </>
                        )}
                    </Button>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="btn btn-outline-secondary py-2 rounded-pill fw-semibold"
                    >
                        <BoxArrowRight className="me-2" size={16} />
                        Log Out
                    </Link>
                </div>

                {/* Help Text */}
                <div className="text-center small text-secondary">
                    <Shield className="me-1" size={12} />
                    Check your spam folder if you don't see the email in your
                    inbox
                </div>
            </Form>

            {/* Need Help Section */}
            <div className="mt-4 pt-3 border-top text-center">
                <p className="small text-secondary mb-2">
                    Having trouble verifying your email?
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

            {/* Email Status Indicator */}
            <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                <div
                    className="bg-warning rounded-circle"
                    style={{ width: "6px", height: "6px" }}
                />
                <span className="small text-secondary">
                    Awaiting email verification
                </span>
            </div>
        </GuestLayout>
    );
}
