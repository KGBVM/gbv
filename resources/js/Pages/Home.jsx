import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AppLayout from "@/Layouts/AppLayout";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    ProgressBar,
} from "react-bootstrap";
import {
    Shield,
    Telephone,
    Clock,
    Heart,
    People,
    Building,
    ArrowRight,
    ExclamationTriangle,
    Book,
    GraphUp,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    HeartPulse,
    PersonBadge,
} from "react-bootstrap-icons";
import useTranslation from "@/hooks/useTranslationData";

export default function Home({ auth }) {
    const { t } = useTranslation();
    const [currentTip, setCurrentTip] = useState(0);

    const safetyTips = [
        t.safetyTip1 ||
            "If in danger, find a safe place and call 1195 immediately",
        t.safetyTip2 ||
            "Memorize emergency numbers or save them under different names",
        t.safetyTip3 ||
            "Pack essential documents in case you need to leave quickly",
        t.safetyTip4 || "Establish a code word with trusted friends or family",
        t.safetyTip5 || "Keep your phone charged and have emergency credit",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % safetyTips.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [safetyTips.length]);

    const countyStats = {
        population: "1.2M",
        area: "30,496 km²",
        wards: 40,
        healthFacilities: 147,
        policeStations: 23,
        partners: 43,
    };

    const stats = [
        {
            label: t.activeCases,
            value: "247",
            icon: Heart,
            change: "+12%",
            trend: "up",
            color: "primary",
        },
        {
            label: t.survivorsHelped,
            value: "1,847",
            icon: People,
            change: "+23%",
            trend: "up",
            color: "success",
        },
        {
            label: t.partnerAgencies,
            value: "43",
            icon: Building,
            change: "+5",
            trend: "up",
            color: "info",
        },
        {
            label: t.responseTime,
            value: "4.2m",
            icon: Clock,
            change: "-18%",
            trend: "down",
            color: "warning",
        },
    ];

    const emergencyServices = [
        {
            name: t.helpline,
            number: "1195",
            description: "24/7 Confidential Support",
            icon: Telephone,
            color: "danger",
            action: "Call Now",
        },
        {
            name: t.police,
            number: "999",
            description: "Immediate Danger",
            icon: Shield,
            color: "danger",
            action: "Call Now",
        },
        {
            name: t.hospital,
            number: "020-2222-111",
            description: "Medical Emergency",
            icon: HeartPulse,
            color: "warning",
            action: "Get Directions",
        },
        {
            name: "Child Helpline",
            number: "116",
            description: "Children in Need",
            icon: PersonBadge,
            color: "info",
            action: "Call Now",
        },
    ];

    return (
        <AppLayout>
            <Head title="Kitui County GBV Information System" />
            
            {/* Hero Section */}
            <div className="hero-section position-relative overflow-hidden">
                <div className="animated-bg">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                    <div className="floating-shape shape-4"></div>
                </div>

                <Container
                    className="py-5 position-relative"
                    style={{ zIndex: 10 }}
                >
                    <Row className="align-items-center g-4">
                        <Col lg={7}>
                            <div className="d-flex flex-wrap gap-2 mb-4 fade-in-up">
                                <Badge
                                    bg="primary"
                                    className="px-3 py-2 rounded-pill shadow-sm"
                                >
                                    <Shield className="me-2" /> Kitui County
                                </Badge>
                                <Badge
                                    bg="danger"
                                    className="px-3 py-2 rounded-pill pulse"
                                >
                                    <ExclamationTriangle className="me-2" />{" "}
                                    24/7 Emergency
                                </Badge>
                            </div>

                            <h1
                                className="display-5 fw-bold mb-3 fade-in-up"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Gender-Based Violence
                                <span className="gradient-text d-block mt-2">
                                    Information System
                                </span>
                            </h1>

                            <p
                                className="lead mb-4 fade-in-up"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {t.aCoordinatedResponse}
                            </p>

                            <Row className="g-3 mb-4 fade-in-up">
                                {Object.entries(countyStats)
                                    .slice(0, 4)
                                    .map(([key, value]) => (
                                        <Col xs={6} md={3} key={key}>
                                            <div
                                                className="p-3 rounded-4"
                                                style={{
                                                    backgroundColor:
                                                        "var(--surface-bg)",
                                                }}
                                            >
                                                <h5
                                                    className="mb-0"
                                                    style={{
                                                        color: "var(--text-primary)",
                                                    }}
                                                >
                                                    {value}
                                                </h5>
                                                <small
                                                    style={{
                                                        color: "var(--text-secondary)",
                                                    }}
                                                    className="text-capitalize"
                                                >
                                                    {key
                                                        .replace(
                                                            /([A-Z])/g,
                                                            " $1",
                                                        )
                                                        .trim()}
                                                </small>
                                            </div>
                                        </Col>
                                    ))}
                            </Row>

                            <div className="d-flex gap-3 flex-wrap fade-in-up">
                                {auth.user ? (
                                    <Button
                                        as={Link}
                                        href="/dashboard"
                                        size="lg"
                                        className="gradient-btn rounded-pill px-5 py-3 border-0"
                                    >
                                        Dashboard{" "}
                                        <ArrowRight className="ms-2" />
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            as={Link}
                                            href="/get-help"
                                            size="lg"
                                            variant="primary"
                                            className="rounded-pill px-5 py-3 hover-lift"
                                        >
                                            <Heart className="me-2" />{" "}
                                            {t.getHelpNow}
                                        </Button>
                                        <Button
                                            as={Link}
                                            href="/resources"
                                            size="lg"
                                            variant="outline-primary"
                                            className="rounded-pill px-5 py-3 hover-lift"
                                        >
                                            {t.learnMore}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Col>

                        <Col lg={5}>
                            <Card className="border-0 shadow-xl rounded-4 overflow-hidden fade-in-right">
                                <Card.Body
                                    className="p-4"
                                    style={{
                                        backgroundColor: "var(--surface-bg)",
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                                            <GraphUp size={24} />
                                        </div>
                                        <div>
                                            <h5
                                                className="mb-1"
                                                style={{
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {t.liveDashboard}
                                            </h5>
                                            <p
                                                className="small mb-0"
                                                style={{
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {t.realTimeStats}
                                            </p>
                                        </div>
                                    </div>

                                    <Row className="g-3 mb-4">
                                        {stats.map((stat, index) => {
                                            const Icon = stat.icon;
                                            return (
                                                <Col xs={6} key={index}>
                                                    <div
                                                        className="p-3 rounded-4"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--nav-hover-bg)",
                                                        }}
                                                    >
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <Icon
                                                                className={`text-${stat.color}`}
                                                                size={16}
                                                            />
                                                            <small
                                                                style={{
                                                                    color: "var(--text-secondary)",
                                                                }}
                                                            >
                                                                {stat.label}
                                                            </small>
                                                        </div>
                                                        <div className="d-flex align-items-end justify-content-between">
                                                            <h4
                                                                className="mb-0"
                                                                style={{
                                                                    color: "var(--text-primary)",
                                                                }}
                                                            >
                                                                {stat.value}
                                                            </h4>
                                                            <span
                                                                className={`text-${stat.trend === "up" ? "success" : "danger"} small d-flex align-items-center`}
                                                            >
                                                                {stat.trend ===
                                                                "up" ? (
                                                                    <ArrowUpRight />
                                                                ) : (
                                                                    <ArrowDownRight />
                                                                )}
                                                                {stat.change}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small
                                                style={{
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                {t.monthlyTarget}
                                            </small>
                                            <small
                                                style={{
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                78%
                                            </small>
                                        </div>
                                        <ProgressBar
                                            now={78}
                                            variant="success"
                                            style={{
                                                height: "8px",
                                                borderRadius:
                                                    "var(--radius-full)",
                                                backgroundColor:
                                                    "var(--nav-hover-bg)",
                                            }}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <small
                                            style={{
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            <Clock className="me-1" size={12} />
                                            {t.updated} 2 min ago
                                        </small>
                                        <Badge
                                            bg="success"
                                            className="rounded-pill px-3 py-2"
                                        >
                                            <ShieldCheck
                                                className="me-1"
                                                size={10}
                                            />
                                            {t.secure}
                                        </Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* County Resources Banner */}
            <div className="py-4" style={{ backgroundColor: "var(--main-bg)" }}>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <h5 className="text-white mb-2">
                                {t.knowYourRights}
                            </h5>
                            <p className="text-white-50 small mb-0">
                                {t.accessFreeMaterials}
                            </p>
                        </Col>
                        <Col lg={4} className="text-lg-end mt-3 mt-lg-0">
                            <Button
                                variant="light"
                                className="rounded-pill px-5"
                                as={Link}
                                href="/resources"
                            >
                                <Book className="me-2" />
                                {t.viewResources}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        </AppLayout>
    );
}
