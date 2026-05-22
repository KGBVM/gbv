import useTranslation from "@/hooks/useTranslationData";
import { usePage, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    Container,
    Nav,
    Button,
    Badge,
    Row,
    Col,
    Alert,
    Image,
} from "react-bootstrap";
import {
    Shield,
    Heart,
    People,
    Lock,
    ExclamationTriangle,
    Telephone,
    InfoCircle,
    Book,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    WifiOff,
} from "react-bootstrap-icons";
import PublicNavbar from "@/Components/PublicNavbar";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function AppLayout({ header, children }) {
    const { flash } = usePage().props;
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { t } = useTranslation();

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Footer sections - using t object
    const footerSections = [
        {
            title: t.aboutUs,
            icon: InfoCircle,
            links: [
                { name: t.ourMission, href: "/mission" },
                { name: t.team, href: "/team" },
                { name: t.annualReports, href: "/reports" },
                { name: t.mediaCenter, href: "/media" },
            ],
        },
        {
            title: t.getSupport,
            icon: Heart,
            links: [
                { name: t.helpline, href: "/helpline", badge: "24/7" },
                { name: t.findShelter, href: "/shelters" },
                { name: t.legalAid, href: "/legal-aid" },
                { name: t.counseling, href: "/counseling" },
            ],
        },
        {
            title: t.resources,
            icon: Book,
            links: [
                { name: t.educationalMaterials, href: "/materials" },
                { name: t.researchData, href: "/research" },
                { name: t.policyDocuments, href: "/policies" },
                { name: t.faqs, href: "/faqs" },
            ],
        },
        {
            title: t.getInvolved,
            icon: People,
            links: [
                { name: t.volunteer, href: "/volunteer" },
                { name: t.donate, href: "/donate" },
                { name: t.partnerships, href: "/register" },
                { name: t.events, href: "/events" },
            ],
        },
    ];

    // Emergency contacts - Kitui County specific
    const emergencyContacts = [
        {
            name: t.helpline,
            number: "1195",
            description: "24/7 Confidential",
            color: "danger",
        },
        {
            name: t.police,
            number: "999",
            description: "Immediate Danger",
            color: "danger",
        },
        {
            name: t.hospital,
            number: "020-2222-111",
            description: "Medical Emergency",
            color: "warning",
        },
        {
            name: "Child Helpline",
            number: "116",
            description: "Children in need",
            color: "info",
        },
    ];

    return (
        <ThemeProvider>
            <div className="d-flex flex-column min-vh-100">
                {/* Network Status Alert */}
                {isOffline && (
                    <Alert
                        variant="warning"
                        className="rounded-0 text-center mb-0 py-2 animate-slide-in"
                        style={{ fontSize: "0.9rem" }}
                    >
                        <WifiOff className="me-2" />
                        You are currently offline. Some features may be limited.
                    </Alert>
                )}

                {/* Emergency Bar */}
                <div className="bg-danger text-white py-2 position-relative">
                    <Container fluid="lg">
                        <Row className="align-items-center">
                            <Col xs={12} md={6}>
                                <div className="d-flex align-items-center gap-3">
                                    <Telephone className="me-2" size={18} />
                                    <span className="fw-bold">
                                        {t.emergency}: {t.helpline} 1195
                                    </span>
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        pill
                                        className="px-3 pulse"
                                    >
                                        24/7
                                    </Badge>
                                </div>
                            </Col>
                            <Col
                                xs={12}
                                md={6}
                                className="text-md-end mt-2 mt-md-0"
                            >
                                <div className="d-flex gap-3 justify-content-md-end">
                                    {emergencyContacts
                                        .slice(0, 2)
                                        .map((contact, idx) => (
                                            <a
                                                key={idx}
                                                href={`tel:${contact.number}`}
                                                className="text-white text-decoration-none small hover-opacity-100"
                                            >
                                                <Telephone
                                                    size={12}
                                                    className="me-1"
                                                />
                                                {contact.name}: {contact.number}
                                            </a>
                                        ))}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert
                        variant="success"
                        className="rounded-0 text-center mb-0 py-2 animate-slide-in"
                    >
                        <Shield
                            className="me-2"
                            style={{ color: "var(--main-bg)" }}
                        />
                        {flash.success}
                    </Alert>
                )}
                {flash?.error && (
                    <Alert
                        variant="danger"
                        className="rounded-0 text-center mb-0 py-2 animate-slide-in"
                    >
                        <ExclamationTriangle className="me-2" />
                        {flash.error}
                    </Alert>
                )}

                {/* Public Navbar */}
                <PublicNavbar />

                {/* Header section */}
                {header && (
                    <div
                        className="border-bottom py-4"
                        style={{ backgroundColor: "var(--nav-hover-bg)" }}
                    >
                        <Container fluid="lg">
                            <h4
                                className="mb-0 fw-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {header}
                            </h4>
                        </Container>
                    </div>
                )}

                {/* Main content */}
                <main className="flex-grow-1">{children}</main>

                {/* Footer */}
                <footer
                    className="py-5"
                    style={{
                        backgroundColor: "var(--surface-bg)",
                        color: "var(--text-secondary)",
                    }}
                >
                    <Container fluid="lg">
                        <Row className="g-4 mb-4">
                            <Col lg={4}>
                                <Image
                                    src="https://i.ibb.co/SXxbj86R/gbv-removebg-preview.png"
                                    alt="Kitui County GBV"
                                    width={120}
                                    className="mb-3"
                                />
                                <p className="small opacity-75 mb-3">
                                    {t.aCoordinatedResponse}
                                </p>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    <Badge
                                        bg="primary"
                                        className="rounded-pill px-3 py-2"
                                    >
                                        <Lock className="me-1" /> {t.secure}
                                    </Badge>
                                    <Badge
                                        bg="success"
                                        className="rounded-pill px-3 py-2"
                                    >
                                        <Shield className="me-1" /> Confidential
                                    </Badge>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="rounded-circle p-2 border-0"
                                    >
                                        <Facebook size={14} />
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="rounded-circle p-2 border-0"
                                    >
                                        <Twitter size={14} />
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="rounded-circle p-2 border-0"
                                    >
                                        <Linkedin size={14} />
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="rounded-circle p-2 border-0"
                                    >
                                        <Youtube size={14} />
                                    </Button>
                                </div>
                            </Col>

                            {footerSections.map((section, idx) => (
                                <Col key={idx} lg={2} md={6}>
                                    <h6
                                        className="mb-3 d-flex align-items-center gap-2"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        <section.icon size={14} />
                                        {section.title}
                                    </h6>
                                    <Nav className="flex-column">
                                        {section.links.map((link, linkIdx) => (
                                            <Nav.Link
                                                key={linkIdx}
                                                as={Link}
                                                href={link.href}
                                                className="p-0 mb-2 small"
                                                style={{
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {link.name}
                                                {link.badge && (
                                                    <Badge
                                                        bg="danger"
                                                        className="ms-2"
                                                        pill
                                                    >
                                                        {link.badge}
                                                    </Badge>
                                                )}
                                            </Nav.Link>
                                        ))}
                                    </Nav>
                                </Col>
                            ))}
                        </Row>

                        <div
                            className="rounded-4 p-3"
                            style={{
                                backgroundColor:
                                    "rgba(var(--main-bg-rgb), 0.1)",
                            }}
                        >
                            <Row className="align-items-center g-3">
                                {emergencyContacts.map((contact, idx) => (
                                    <Col key={idx} lg={3} md={6}>
                                        <div className="d-flex align-items-center gap-2">
                                            <Telephone
                                                className={`text-${contact.color}`}
                                                size={16}
                                            />
                                            <div>
                                                <div
                                                    className="fw-bold small"
                                                    style={{
                                                        color: "var(--text-primary)",
                                                    }}
                                                >
                                                    {contact.number}
                                                </div>
                                                <small
                                                    style={{
                                                        color: "var(--text-secondary)",
                                                    }}
                                                >
                                                    {contact.name}
                                                </small>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Container>
                </footer>

                <div className="page-bottom bg-danger py-4">
                    <Container className="d-flex justify-content-between text-white fw-bold">
                        <small>
                            © {new Date().getFullYear()} Kitui County Government
                        </small>
                        <div className="d-flex gap-3 mt-2 mt-md-0">
                            <Link
                                href="/privacy"
                                className="text-decoration-none text-white small"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-decoration-none text-white small"
                            >
                                Terms and Conditions
                            </Link>
                        </div>
                    </Container>
                </div>
            </div>
        </ThemeProvider>
    );
}
