import { useState, useEffect, useMemo, useCallback } from "react";
import { Image, Container, Button, Dropdown } from "react-bootstrap";
import { router, usePage } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";

import Sidebar from "@/Components/Sidebar";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useErrorToast } from "@/hooks/useErrorToast";

const AuthenticatedLayout = ({ children }) => {
    const { auth, flash } = usePage().props;
    const { hasAnyRole, firstRole } = useRolePermissions();
    const { showErrorToast } = useErrorToast();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Handle window resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 991.98;
            setIsMobile(mobile);
            if (mobile) setSidebarCollapsed(false);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Show error toasts from flash messages
    useEffect(() => {
        if (flash?.errors) {
            showErrorToast(flash.errors);
        }
    }, [flash?.errors, showErrorToast]);

    // Main navigation items
    const navItems = useMemo(() => {
        const items = [
            {
                label: "Dashboard",
                href: route("dashboard"),
                icon: "bi bi-speedometer2",
            },
            {
                label: "Cases",
                href: route("gbv-cases.index"),
                icon: "bi bi-folder",
            },
            {
                label: "Referrals",
                href: route("referrals.index"),
                icon: "bi bi-share",
            },
            {
                label: "Survivors",
                href: route("survivors.index"),
                icon: "bi bi-people",
            },
        ];

        // Add admin-only items
        if (hasAnyRole(["super_admin", "admin"])) {
            items.push({
                label: "Partners",
                href: route("partners.index"),
                icon: "bi bi-shield-shaded",
            });
        }

        return items;
    }, [hasAnyRole]);

    // Secondary navigation items
    const secondaryNavItems = useMemo(() => {
        const items = [];

        if (hasAnyRole(["super_admin", "admin"])) {
            items.push({
                label: "Reports & Analytics",
                href: route("reports.index"),
                icon: "bi bi-bar-chart-line",
            });
        }

        return items;
    }, [hasAnyRole]);

    // Toggle sidebar collapse
    const toggleSidebarCollapse = useCallback(() => {
        setSidebarCollapsed((prev) => !prev);
    }, []);

    // Toggle mobile sidebar
    const toggleMobileSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    // Handle logout
    const handleLogout = useCallback(() => {
        router.post(route("logout"));
    }, []);

    // Get user display name
    const userDisplayName = useMemo(() => {
        return auth?.user?.name || "User";
    }, [auth?.user?.name]);

    // Get user email
    const userEmail = useMemo(() => {
        return auth?.user?.email || "";
    }, [auth?.user?.email]);

    // Get profile image URL
    const profileImageUrl = useMemo(() => {
        return (
            auth?.user?.profile_image_url ||
            "https://i.ibb.co/W4ny1p4M/avatar-2.png"
        );
    }, [auth?.user?.profile_image_url]);

    // Get role display name
    const roleDisplayName = useMemo(() => {
        return firstRole?.name?.replace(/_/g, " ") || "";
    }, [firstRole?.name]);

    return (
        <div className="portal-layout">
            <ToastContainer
                position="top-center"
                autoClose={2000}
                newestOnTop
                closeOnClick
                pauseOnHover
            />

            {/* Sidebar */}
            <Sidebar
                navItems={navItems}
                secondaryNavItems={secondaryNavItems}
                isOpen={sidebarOpen}
                onClose={toggleMobileSidebar}
                isMobile={isMobile}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebarCollapse}
            />

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="top-navbar border-bottom">
                    <Container
                        fluid
                        className="d-flex align-items-center justify-content-between p-3"
                    >
                        {/* Left: Sidebar Toggle + Access Mode */}
                        <div className="d-flex align-items-center gap-3">
                            {!isMobile ? (
                                <Button
                                    variant="link"
                                    className="p-0 text-decoration-none"
                                    onClick={toggleSidebarCollapse}
                                    aria-label="Toggle sidebar"
                                >
                                    <span className="fs-4">
                                        {sidebarCollapsed ? "☰" : "✕"}
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    variant="link"
                                    className="p-0 text-decoration-none"
                                    onClick={toggleMobileSidebar}
                                    aria-label="Open sidebar"
                                >
                                    <span className="fs-4">☰</span>
                                </Button>
                            )}

                            {roleDisplayName && (
                                <h4 className="m-0 text-muted text-capitalize">
                                    {roleDisplayName}
                                </h4>
                            )}
                        </div>

                        {/* Right: User Dropdown */}
                        <div className="d-flex align-items-center">
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    className="p-0 border-0"
                                    aria-label="User menu"
                                >
                                    <Image
                                        src={profileImageUrl}
                                        roundedCircle
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            objectFit: "cover",
                                        }}
                                        className="bg-info bg-opacity-25 p-1"
                                        alt="User avatar"
                                    />
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="border-0 shadow-lg mt-2">
                                    <Dropdown.Header>
                                        {auth?.user?.partner
                                            ?.organization_name && (
                                            <div className="fw-bold">
                                                {
                                                    auth?.user?.partner
                                                        ?.organization_name
                                                }
                                            </div>
                                        )}
                                        <div className="fw-bold mt-1">
                                            {userDisplayName}
                                        </div>
                                        <div className="text-muted small">
                                            {userEmail}
                                        </div>
                                    </Dropdown.Header>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href={route("profile.edit")}>
                                        👤 Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                    // href={route("settings.index")}
                                    >
                                        ⚙️ Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>
                                        🚪 Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Container>
                </header>

                {/* Content Area */}
                <Container fluid className="content-wrapper py-3">
                    {children}
                </Container>

                {/* Footer */}
                <footer className="main-footer p-3 border-top mt-auto">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="text-muted small">
                            © {new Date().getFullYear()} Kitui County GBV Portal
                        </span>
                        <div className="d-flex gap-3">
                            <a
                                href="/support"
                                className="text-muted text-decoration-none small"
                            >
                                🆘 Support
                            </a>
                            <a
                                href="/about"
                                className="text-muted text-decoration-none small"
                            >
                                ℹ️ About
                            </a>
                            <a
                                href="/contact"
                                className="text-muted text-decoration-none small"
                            >
                                📞 Contact
                            </a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AuthenticatedLayout;
