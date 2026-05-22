import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Container, Row, Col, Card, Badge, Alert } from "react-bootstrap";
import {
    BiCheckCircle,
    BiData,
    BiFileBlank,
    BiLineChart,
    BiShare,
    BiLock,
    BiArchive,
    BiUserCheck,
    BiErrorCircle,
    BiEnvelope,
    BiCheckShield,
    BiHide,
    BiRefresh,
    BiBuilding,
    BiDetail,
    BiStats,
    BiSolidUserBadge,
} from "react-icons/bi";
import { BsShieldLock } from "react-icons/bs";

const PrivacyPolicy = () => {
    return (
        <AppLayout>
            <Head title="Privacy Policy" />

            <Container className="py-4">
                {/* Header Section */}
                <Card className="shadow-sm border-0 mb-5 overflow-hidden">
                    <Card.Header className="bg-primary text-white py-4 border-0">
                        <Row className="align-items-center">
                            <Col>
                                <h1 className="display-5 fw-bold mb-0">
                                    Privacy Policy
                                </h1>
                                <p className="text-white-50 mb-0 mt-2">
                                    GBV Monitoring Tool System
                                </p>
                                <small className="text-white-50">
                                    County Government of Kitui
                                </small>
                            </Col>
                            <Col xs="auto">
                                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                                    <BsShieldLock
                                        size={40}
                                        className="text-success"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="bg-white py-3">
                        <Alert variant="info" className="mb-0">
                            <div className="d-flex align-items-center gap-2">
                                <BiCheckCircle
                                    size={18}
                                    className="text-info"
                                />
                                <span className="fw-semibold">
                                    The County Government of Kitui is committed
                                    to protecting the privacy and
                                    confidentiality of all data processed within
                                    the GBV Monitoring Tool.
                                </span>
                            </div>
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 1: Introduction */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiFileBlank size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                1.0 INTRODUCTION
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            The County Government of Kitui is committed to
                            protecting the privacy and confidentiality of all
                            data processed within the GBV Monitoring Tool. This
                            Privacy Policy explains how data is collected, used,
                            stored, and protected.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 2: Purpose */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiCheckShield size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                2.0 PURPOSE
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>The purpose of this policy is to:</p>
                        <Row className="g-3">
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BsShieldLock
                                            size={28}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Ensure Data Privacy
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BiHide
                                            size={28}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Protect Survivor Information
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BiCheckShield
                                            size={28}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Comply with Legal Requirements
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 3: Data Collected */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiData size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                3.0 DATA COLLECTED
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>The system may collect:</p>
                        <Row>
                            <Col md={4} className="mb-3 mb-md-0">
                                <h5 className="text-primary">
                                    <BiSolidUserBadge
                                        size={18}
                                        className="me-1"
                                    />{" "}
                                    3.1 Personal Data
                                </h5>
                                <ul className="mb-0">
                                    <li>Survivor details</li>
                                    <li>Contact information</li>
                                </ul>
                            </Col>
                            <Col md={4} className="mb-3 mb-md-0">
                                <h5 className="text-primary">
                                    <BiDetail size={18} className="me-1" /> 3.2
                                    Case Data
                                </h5>
                                <ul className="mb-0">
                                    <li>Incident details</li>
                                    <li>Case status</li>
                                    <li>Service records</li>
                                </ul>
                            </Col>
                            <Col md={4}>
                                <h5 className="text-primary">
                                    <BiUserCheck size={18} className="me-1" />{" "}
                                    3.3 User Data
                                </h5>
                                <ul className="mb-0">
                                    <li>Login credentials</li>
                                    <li>Activity logs</li>
                                </ul>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 4: Purpose of Data Collection */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiStats size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                4.0 PURPOSE OF DATA COLLECTION
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>Data is collected for:</p>
                        <Row className="g-3">
                            <Col md={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiFileBlank
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        GBV Case Management
                                    </p>
                                </div>
                            </Col>
                            <Col md={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiShare
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Service Coordination
                                    </p>
                                </div>
                            </Col>
                            <Col md={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiLineChart
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Reporting & Analysis
                                    </p>
                                </div>
                            </Col>
                            <Col md={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiBuilding
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Policy Development
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 5: Data Processing */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiRefresh size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                5.0 DATA PROCESSING
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={4}>
                                <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                    <BiCheckCircle
                                        size={20}
                                        className="text-success"
                                    />
                                    <span>Processed lawfully</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                    <BiCheckCircle
                                        size={20}
                                        className="text-success"
                                    />
                                    <span>Used only for intended purposes</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                    <BiCheckCircle
                                        size={20}
                                        className="text-success"
                                    />
                                    <span>Handled with confidentiality</span>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 6: Data Sharing */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiShare size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                6.0 DATA SHARING
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>Data may be shared:</p>
                        <Row>
                            <Col md={6} className="mb-3 mb-md-0">
                                <h5 className="text-primary">6.1 Internally</h5>
                                <Card className="bg-light border-0">
                                    <Card.Body>
                                        <Badge bg="secondary" className="mb-2">
                                            Authorized Institutions
                                        </Badge>
                                        <p className="mb-0 small">
                                            Access granted only to verified and
                                            approved entities
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <h5 className="text-primary">6.2 Externally</h5>
                                <Card className="bg-light border-0">
                                    <Card.Body>
                                        <ul className="mb-0">
                                            <li>Only where necessary</li>
                                            <li>In compliance with law</li>
                                            <li>Anonymized where possible</li>
                                        </ul>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 7: Data Security */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiLock size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                7.0 DATA SECURITY
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>The system implements:</p>
                        <Row className="g-3">
                            <Col sm={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiLock
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Encryption
                                    </p>
                                </div>
                            </Col>
                            <Col sm={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiSolidUserBadge
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Access Control
                                    </p>
                                </div>
                            </Col>
                            <Col sm={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiFileBlank
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Audit Logging
                                    </p>
                                </div>
                            </Col>
                            <Col sm={6} lg={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <BiArchive
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="mb-0 fw-semibold">
                                        Secure Storage
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 8: Data Retention */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiArchive size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                8.0 DATA RETENTION
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>Data shall be:</p>
                        <ul className="mb-0">
                            <li>Retained as required by law</li>
                            <li>Securely archived</li>
                            <li>Deleted when no longer needed</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 9: User Rights */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiUserCheck size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                9.0 USER RIGHTS
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>Users have the right to:</p>
                        <Row className="g-3">
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BiHide
                                            size={24}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Access their data
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BiRefresh
                                            size={24}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Request correction
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4}>
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body className="text-center">
                                        <BiArchive
                                            size={24}
                                            className="text-primary mb-2"
                                        />
                                        <p className="mb-0 fw-semibold">
                                            Request deletion (where applicable)
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 10: Confidentiality */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BsShieldLock size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                10.0 CONFIDENTIALITY
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Alert variant="danger">
                            <BiErrorCircle size={18} className="me-2" />
                            All GBV data is highly sensitive. Unauthorized
                            disclosure is strictly prohibited.
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 11: Data Breach Response */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiErrorCircle size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                11.0 DATA BREACH RESPONSE
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>In case of a breach:</p>
                        <div className="d-flex flex-wrap gap-3 justify-content-between">
                            <div className="text-center flex-grow-1">
                                <div
                                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <span className="fw-bold">1</span>
                                </div>
                                <p className="mb-0 small">Identify Incident</p>
                            </div>
                            <div className="text-center flex-grow-1">
                                <div
                                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <span className="fw-bold">2</span>
                                </div>
                                <p className="mb-0 small">Contain Breach</p>
                            </div>
                            <div className="text-center flex-grow-1">
                                <div
                                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <span className="fw-bold">3</span>
                                </div>
                                <p className="mb-0 small">Notify Authorities</p>
                            </div>
                            <div className="text-center flex-grow-1">
                                <div
                                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                    style={{ width: 40, height: 40 }}
                                >
                                    <span className="fw-bold">4</span>
                                </div>
                                <p className="mb-0 small">
                                    Take Corrective Action
                                </p>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Section 12: Compliance */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiCheckShield size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                12.0 COMPLIANCE
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p>This policy complies with:</p>
                        <ul className="mb-0">
                            <li>Kenya Data Protection Act (2019)</li>
                            <li>Applicable ICT policies</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 13: Policy Updates */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiRefresh size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                13.0 POLICY UPDATES
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            This policy may be updated periodically. Users will
                            be notified of any significant changes.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 14: Contact Information */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex align-items-center gap-2">
                            <BiEnvelope size={22} className="text-primary" />
                            <h2 className="h4 mb-0 text-primary">
                                14.0 CONTACT INFORMATION
                            </h2>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="text-center p-3 bg-light rounded">
                            <BiBuilding
                                size={28}
                                className="text-primary mb-2"
                            />
                            <p className="mb-0 fw-semibold">
                                County Government of Kitui
                            </p>
                            <p className="mb-0">Department of ICT</p>
                            <div className="mt-2">
                                <Badge bg="secondary">
                                    For privacy-related inquiries
                                </Badge>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Section 15: Consent */}
                <Card className="shadow-sm border-0 mb-4 bg-primary bg-opacity-10">
                    <Card.Body className="text-center">
                        <BiCheckCircle
                            size={32}
                            className="text-primary mb-3"
                        />
                        <h3 className="h5 mb-3">15.0 CONSENT</h3>
                        <p className="mb-0 fw-semibold">
                            By using the system, users consent to this Privacy
                            Policy.
                        </p>
                    </Card.Body>
                </Card>

                {/* Footer Note */}
                <div className="text-center text-muted mt-4">
                    <small>
                        <BsShieldLock size={12} className="me-1" />
                        GBV Monitoring Tool System - County Government of Kitui
                    </small>
                </div>
            </Container>
        </AppLayout>
    );
};

export default PrivacyPolicy;
