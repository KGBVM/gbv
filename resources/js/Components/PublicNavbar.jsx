import { Link, router, usePage } from "@inertiajs/react";
import {
    Navbar,
    Nav,
    Container,
    ButtonGroup,
    Button,
    Offcanvas,
    Dropdown,
    Badge,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
    BsBoxArrowInRight,
    BsHouseDoor,
    BsPerson,
    BsBoxArrowRight,
    BsEnvelope,
    BsInfoCircle,
    BsBook,
    BsNewspaper,
} from "react-icons/bs";
import { BiMenu, BiSolidDashboard } from "react-icons/bi";
import ApplicationLogo from "@/Components/ApplicationLogo";
import useTranslation from "@/hooks/useTranslationData";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import ThemeSwitcher from "@/Components/ThemeSwitcher";

const PublicNavbar = () => {
    const { auth } = usePage().props;
    const { t, currentLanguage } = useTranslation();

    const handleLogout = () => {
        router.post(route("logout"));
    };

    // GBV Navigation Links
    const gbvNavigation = [
        {
            name: t.home || "Home",
            href: "/",
            icon: BsHouseDoor,
            description: "Return to homepage",
        },
        {
            name: t.about || "About",
            href: "/about",
            icon: BsInfoCircle,
            description: "Learn about gender-based violence",
        },
        {
            name: t.resources || "Resources",
            href: "/resources",
            icon: BsBook,
            description: "Guides and educational materials",
        },
        {
            name: t.news || "News",
            href: "/news",
            icon: BsNewspaper,
            description: "Latest updates and events",
        },
        {
            name: t.contact || "Contact",
            href: "/contact",
            icon: BsEnvelope,
            description: "Get in touch with our team",
        },
    ];

    return (
        <Navbar
            bg="white"
            expand="lg"
            className="shadow-sm sticky-top border-0 py-2 fw-semibold"
            style={{ backgroundColor: "var(--surface-bg)" }}
        >
            <Container>
                {/* Logo */}
                <motion.div whileHover={{ scale: 1.03 }}>
                    <Navbar.Brand
                        as={Link}
                        href="/"
                        className="d-flex align-items-center"
                    >
                        <ApplicationLogo width={100} />
                    </Navbar.Brand>
                </motion.div>

                {/* Toggle Button */}
                <Navbar.Toggle
                    aria-controls="offcanvas-navbar"
                    className="border-0 p-0"
                >
                    <BiMenu size={32} />
                </Navbar.Toggle>

                {/* Offcanvas Navigation */}
                <Navbar.Offcanvas id="offcanvas-navbar" placement="start">
                    <Offcanvas.Header closeButton className="border-bottom">
                        <Offcanvas.Title>
                            <ApplicationLogo width={100} />
                        </Offcanvas.Title>
                    </Offcanvas.Header>

                    <Offcanvas.Body>
                        <Nav className="flex-column flex-lg-row w-100 align-items-lg-center justify-content-lg-between gap-1 gap-lg-0">
                            {/* Left Navigation Links - GBV Links */}
                            <Nav className="mx-md-auto flex-column flex-lg-row gap-1">
                                {gbvNavigation.map((item, index) => (
                                    <Nav.Link
                                        key={index}
                                        as={Link}
                                        href={item.href}
                                        className="d-flex align-items-center position-relative"
                                    >
                                        <item.icon className="me-2" size={18} />
                                        {item.name}
                                        {item.badge && (
                                            <Badge
                                                bg="danger"
                                                className="ms-2"
                                                pill
                                                style={{ fontSize: "0.6rem" }}
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                ))}
                            </Nav>

                            {/* Right Auth Section */}
                            <ButtonGroup className="d-flex flex-column flex-lg-row gap-2">
                                <LanguageSwitcher />
                                <ThemeSwitcher />

                                {auth?.user ? (
                                    <Dropdown>
                                        <Dropdown.Toggle
                                            as={Button}
                                            variant="outline-danger"
                                            size="sm"
                                            className="rounded-circle p-1"
                                        >
                                            <BsPerson size={30} />
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu
                                            className="border-0 shadow-sm rounded-0"
                                            align="end"
                                        >
                                            <Dropdown.Header className="bg-light">
                                                <h6 className="m-0">
                                                    {auth?.user?.name}
                                                </h6>
                                                <small>
                                                    {auth?.user?.email}
                                                </small>
                                            </Dropdown.Header>

                                            <Dropdown.Divider />

                                            <Dropdown.Item
                                                as={Link}
                                                href={route("dashboard")}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <BiSolidDashboard />
                                                <span>Dashboard</span>
                                            </Dropdown.Item>

                                            <Dropdown.Item
                                                as={Link}
                                                href={route("profile.edit")}
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <BsPerson />
                                                <span>Profile</span>
                                            </Dropdown.Item>

                                            <Dropdown.Divider />

                                            <Dropdown.Item
                                                onClick={handleLogout}
                                                className="d-flex align-items-center gap-1 text-danger"
                                            >
                                                <BsBoxArrowRight />
                                                <span>Logout</span>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                ) : (
                                    <>
                                        <Button
                                            as={Link}
                                            href="/login"
                                            variant="outline-danger"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 rounded-pill"
                                        >
                                            <BsBoxArrowInRight />
                                            <span>Login</span>
                                        </Button>
                                        <Button
                                            as={Link}
                                            href="/register"
                                            variant="danger"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 rounded-pill"
                                        >
                                            Register
                                        </Button>
                                    </>
                                )}
                            </ButtonGroup>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default PublicNavbar;
