import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    Container,
    Row,
    Col,
    Card,
    Badge,
    ListGroup,
    Alert,
    Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const TermsAndConditions = () => {
    return (
        <AppLayout>
            <Head title="Terms and Conditions" />

            <Container className="py-4">
                {/* Header Section */}
                <Card className="shadow-sm border-0 mb-5 overflow-hidden">
                    <Card.Header className="bg-primary text-white py-4 border-0">
                        <Row className="align-items-center">
                            <Col>
                                <h1 className="display-5 fw-bold mb-0">
                                    Terms and Conditions
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        fill="currentColor"
                                        className="bi bi-shield-check text-success"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.033.293-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.523zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43c.658-.215 1.777-.57 2.887-.87z" />
                                        <path d="M10.854 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                    </svg>
                                </div>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className="bg-white py-3">
                        <Alert variant="info" className="mb-0">
                            <div className="d-flex align-items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    className="bi bi-check-circle-fill"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                </svg>
                                <span className="fw-semibold">
                                    By using this system, you confirm that you
                                    have read and agreed to these Terms and
                                    Conditions.
                                </span>
                            </div>
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 1: Introduction */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            1.0 INTRODUCTION
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            These Terms and Conditions govern the use of the GBV
                            Monitoring Tool System, a digital platform developed
                            by the County Government of Kitui to support the
                            management and monitoring of Gender-Based Violence
                            (GBV) cases. By accessing or using this system,
                            users agree to comply with these Terms and
                            Conditions.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 2: Definitions */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            2.0 DEFINITIONS
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-3 mb-md-0">
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body>
                                        <Badge bg="primary" className="mb-2">
                                            System
                                        </Badge>
                                        <p className="mb-0">
                                            GBV Monitoring Tool
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6} className="mb-3 mb-md-0">
                                <Card className="bg-light border-0 h-100">
                                    <Card.Body>
                                        <Badge bg="primary" className="mb-2">
                                            User
                                        </Badge>
                                        <p className="mb-0">
                                            Any authorized individual accessing
                                            the system
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="bg-light border-0 h-100 mt-3">
                                    <Card.Body>
                                        <Badge bg="primary" className="mb-2">
                                            Institution
                                        </Badge>
                                        <p className="mb-0">
                                            Organization registered to use the
                                            system
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="bg-light border-0 h-100 mt-3">
                                    <Card.Body>
                                        <Badge bg="primary" className="mb-2">
                                            Data
                                        </Badge>
                                        <p className="mb-0">
                                            All information entered, stored, or
                                            processed
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 3: Eligibility */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            3.0 ELIGIBILITY
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>Access to the system is limited to:</p>
                        <ul className="mb-3">
                            <li>Authorized government officers</li>
                            <li>Approved NGOs and CBOs</li>
                            <li>
                                Partner institutions involved in GBV response
                            </li>
                        </ul>
                        <Alert variant="warning" className="mb-0">
                            <strong>Important:</strong> Users must be officially
                            registered and approved.
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 4: User Responsibilities */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            4.0 USER RESPONSIBILITIES
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-3 mb-md-0">
                                <h5 className="text-success">✓ Users Shall:</h5>
                                <ul>
                                    <li>
                                        Provide accurate and complete
                                        information
                                    </li>
                                    <li>
                                        Maintain confidentiality of login
                                        credentials
                                    </li>
                                    <li>
                                        Use the system only for authorized
                                        purposes
                                    </li>
                                    <li>
                                        Comply with all applicable laws and
                                        policies
                                    </li>
                                </ul>
                            </Col>
                            <Col md={6}>
                                <h5 className="text-danger">
                                    ✗ Users Shall Not:
                                </h5>
                                <ul>
                                    <li>Share login credentials</li>
                                    <li>Access unauthorized data</li>
                                    <li>Misuse or manipulate data</li>
                                    <li>Attempt to breach system security</li>
                                </ul>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 5: System Use */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">5.0 SYSTEM USE</h2>
                    </Card.Header>
                    <Card.Body>
                        <p>The system is intended for:</p>
                        <ul>
                            <li>GBV case management</li>
                            <li>Reporting and analysis</li>
                            <li>Inter-agency coordination</li>
                        </ul>
                        <Alert variant="danger" className="mb-0">
                            Any use outside these purposes is strictly
                            prohibited.
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 6: Data Handling */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            6.0 DATA HANDLING
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>Users acknowledge that:</p>
                        <ul className="mb-0">
                            <li>The system contains sensitive GBV data</li>
                            <li>Data must be handled with confidentiality</li>
                            <li>Unauthorized disclosure is prohibited</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 7: Access Control */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            7.0 ACCESS CONTROL
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            The system uses role-based access control (RBAC).
                            Users shall only access data relevant to their role.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 8: Security */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">8.0 SECURITY</h2>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6} className="mb-3 mb-md-0">
                                <h5>Users Shall:</h5>
                                <ul>
                                    <li>Use secure passwords</li>
                                    <li>Log out after sessions</li>
                                    <li>Report suspicious activities</li>
                                </ul>
                            </Col>
                            <Col md={6}>
                                <h5>System Administrators Shall Implement:</h5>
                                <ul>
                                    <li>Encryption</li>
                                    <li>Monitoring</li>
                                    <li>Audit logging</li>
                                </ul>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Section 9: System Availability */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            9.0 SYSTEM AVAILABILITY
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>The County Government of Kitui shall:</p>
                        <ul>
                            <li>Strive to maintain system availability</li>
                            <li>Perform maintenance as needed</li>
                        </ul>
                        <Alert variant="secondary" className="mb-0">
                            However, uninterrupted access is not guaranteed.
                        </Alert>
                    </Card.Body>
                </Card>

                {/* Section 10: Limitation of Liability */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            10.0 LIMITATION OF LIABILITY
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>
                            The County Government of Kitui shall not be liable
                            for:
                        </p>
                        <ul className="mb-0">
                            <li>Misuse of the system by users</li>
                            <li>Unauthorized access due to user negligence</li>
                            <li>System downtime or technical issues</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 11: Termination */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            11.0 TERMINATION
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>Access may be suspended or revoked if:</p>
                        <ul className="mb-0">
                            <li>User violates these terms</li>
                            <li>Misuse of system is detected</li>
                            <li>Security risk is identified</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 12: Intellectual Property */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            12.0 INTELLECTUAL PROPERTY
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-2">
                            The system and its contents remain the property of
                            the County Government of Kitui.
                        </p>
                        <p>Users shall not:</p>
                        <ul className="mb-0">
                            <li>Copy</li>
                            <li>Modify</li>
                            <li>Distribute system components</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 13: Compliance */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            13.0 COMPLIANCE
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p>Users must comply with:</p>
                        <ul className="mb-0">
                            <li>Kenya Data Protection Act (2019)</li>
                            <li>County ICT policies</li>
                            <li>GBV handling guidelines</li>
                        </ul>
                    </Card.Body>
                </Card>

                {/* Section 14: Amendments */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            14.0 AMENDMENTS
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            These Terms may be updated periodically. Users will
                            be notified of significant changes.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 15: Governing Law */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            15.0 GOVERNING LAW
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            These Terms shall be governed by the laws of Kenya.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 16: Contact Information */}
                <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white border-bottom">
                        <h2 className="h4 mb-0 text-primary">
                            16.0 CONTACT INFORMATION
                        </h2>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">
                            For support or inquiries:
                            <br />
                            <strong>County Government of Kitui</strong>
                            <br />
                            Department of ICT
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 17: Acceptance */}
                <Card className="shadow-sm border-0 mb-4 bg-primary bg-opacity-10">
                    <Card.Body className="text-center">
                        <h3 className="h5 mb-3">17.0 ACCEPTANCE</h3>
                        <p className="mb-0 fw-semibold">
                            By using the system, users confirm that they have
                            read and agreed to these Terms and Conditions.
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </AppLayout>
    );
};

export default TermsAndConditions;
