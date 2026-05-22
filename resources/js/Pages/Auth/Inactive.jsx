import { Head, router, usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, Badge, Alert, Button, ButtonGroup } from "react-bootstrap";
import {
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertTriangle,
    FiLock,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { BiPhoneCall, BiSolidLogOut } from "react-icons/bi";

export default function Inactive() {
    const { auth } = usePage().props;
    const partner = auth?.partner;

    const getStatusConfig = (status) => {
        const s = status?.toLowerCase();
        const configs = {
            pending: {
                variant: "warning",
                icon: FiClock,
                title: "Pending Approval",
                message: "Your application is under review.",
            },
            approved: {
                variant: "success",
                icon: FiCheckCircle,
                title: "Approved",
                message: "Your account is approved but not yet active.",
            },
            rejected: {
                variant: "danger",
                icon: FiXCircle,
                title: "Application Rejected",
                message: "Your application has been rejected.",
            },
            suspended: {
                variant: "dark",
                icon: FiAlertTriangle,
                title: "Account Suspended",
                message: "Your account has been suspended.",
            },
        };
        return (
            configs[s] || {
                variant: "secondary",
                icon: FiLock,
                title: "Account Inactive",
                message: "Your account is currently inactive.",
            }
        );
    };

    const config = getStatusConfig(partner?.status);
    const Icon = config.icon;

    return (
        <GuestLayout>
            <Head title="Partner Inactive - GBV Portal" />

            <Card className="text-center shadow-sm border-0">
                <Card.Body className="p-4">
                    <Icon size={48} className={`text-${config.variant} mb-3`} />
                    <h4 className="fw-bold mb-2">{config.title}</h4>
                    <p className="text-muted small mb-4">
                        Kitui County GBV Information System
                    </p>

                    <div className="text-start bg-light rounded p-3 mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <BsBuilding size={16} />
                            <strong>
                                {partner?.organization_name || "N/A"}
                            </strong>
                        </div>
                        <div className="d-flex justify-content-between small text-capitalize">
                            <span className="text-muted">Status:</span>
                            <Badge bg={config.variant}>
                                {partner?.status || "Inactive"}
                            </Badge>
                        </div>
                        <div className="d-flex justify-content-between small mt-1">
                            <span className="text-muted">Terms Accepted:</span>
                            <span>
                                {partner?.terms_accepted ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>

                    <Alert variant={config.variant} className="small py-2">
                        {config.message} Contact support for help.
                    </Alert>

                    <ButtonGroup className="d-flex gap-2">
                        {/* Contact Support */}
                        <Button
                            variant={config.variant}
                            className="rounded-pill"
                        >
                            <BiPhoneCall size={16} className="me-1" />
                            Contact Support
                        </Button>
                        {/* Logout */}
                        <Button
                            variant="outline-secondary"
                            className="rounded-pill"
                            onClick={() => {
                                router.post(route("logout"));
                            }}
                        >
                            <BiSolidLogOut size={16} className="me-1" />
                            Logout
                        </Button>
                    </ButtonGroup>
                </Card.Body>
            </Card>
        </GuestLayout>
    );
}
