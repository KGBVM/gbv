import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Image, Offcanvas } from "react-bootstrap";

export default function Sidebar({
    navItems,
    secondaryNavItems,
    isOpen,
    onClose,
    isMobile,
    isCollapsed,
}) {
    const [expandedItems, setExpandedItems] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);

    const toggleExpand = (label) => {
        setExpandedItems((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    const handleItemClick = (item, e) => {
        if (item.children && item.children.length > 0) {
            e.preventDefault();
            toggleExpand(item.label);
            return;
        }

        if (isMobile) onClose();
    };

    const renderNavItem = (item, index) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.label);
        const isHovered = hoveredItem === item.label;

        return (
            <div
                key={index}
                className="nav-item-wrapper"
                onMouseEnter={() => !isMobile && setHoveredItem(item.label)}
                onMouseLeave={() => !isMobile && setHoveredItem(null)}
            >
                <Link
                    href={hasChildren ? "#" : item.href}
                    className={`nav-link d-flex align-items-center p-3 ${
                        item.active ? "active" : ""
                    } ${
                        isCollapsed
                            ? "justify-content-center"
                            : "justify-content-between"
                    }`}
                    onClick={(e) => handleItemClick(item, e)}
                    title={isCollapsed ? item.label : ""}
                >
                    {/* Left: Icon + Label */}
                    <div
                        className="d-flex align-items-center"
                        style={{ gap: isCollapsed ? 0 : "12px" }}
                    >
                        <i
                            className={`${item.icon} nav-icon`}
                            style={{ fontSize: "1.2rem" }}
                        />

                        {!isCollapsed && (
                            <span className="nav-label">{item.label}</span>
                        )}
                    </div>

                    {/* Right: Arrow / Badge */}
                    <div className="d-flex align-items-center gap-1">
                        {!isCollapsed && hasChildren && (
                            <span className="transition-all">
                                {isExpanded ? (
                                    <i className="bi bi-chevron-up" />
                                ) : (
                                    <i className="bi bi-chevron-down" />
                                )}
                            </span>
                        )}

                        {!isCollapsed && item.badge && (
                            <span className="badge bg-danger rounded-pill ms-2">
                                {item.badge}
                            </span>
                        )}
                    </div>

                    {/* Tooltip (collapsed desktop) */}
                    {isCollapsed && (isHovered || item.active) && (
                        <div className="sidebar-tooltip">
                            {item.label}
                            {item.badge && (
                                <span className="badge bg-danger rounded-pill ms-2">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    )}
                </Link>

                {/* Sub-navigation */}
                {hasChildren && isExpanded && !isCollapsed && (
                    <div className="sub-nav ps-3">
                        {item.children.map((subItem, subIndex) => (
                            <Link
                                key={subIndex}
                                href={subItem.href}
                                className="nav-link py-2 px-4 d-flex align-items-center"
                                onClick={() => isMobile && onClose()}
                            >
                                {subItem.icon && (
                                    <i className={`${subItem.icon} me-2`} />
                                )}
                                {subItem.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /* ===== Mobile Sidebar ===== */
    const renderMobileSidebar = () => (
        <Offcanvas
            show={isOpen}
            onHide={onClose}
            placement="start"
            className="sidebar-offcanvas"
        >
            <Offcanvas.Header closeButton className="border-bottom p-3">
                <Offcanvas.Title className="d-flex align-items-center gap-3">
                    <Image
                        src={
                            "https://i.ibb.co/SXxbj86R/gbv-removebg-preview.png"
                        }
                        alt={"Kitui County GBV"}
                        width={40}
                        height={40}
                        roundedCircle
                    />
                    <h6 className="mb-0 fw-bold">{"Kitui County GBV"}</h6>
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-0 d-flex flex-column">
                <div className="sidebar-nav flex-grow-1 overflow-auto">
                    {/* Primary Navigation */}
                    {navItems.map(renderNavItem)}

                    {secondaryNavItems.length > 0 && (
                        <>
                            {/* Divider */}
                            <div className="border-top my-2"></div>

                            {/* Secondary Navigation */}
                            {secondaryNavItems?.map(renderNavItem)}
                        </>
                    )}
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );

    /* ===== Desktop Sidebar ===== */
    const renderDesktopSidebar = () => (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header d-flex align-items-center p-3 border-bottom">
                <Image
                    src={"https://i.ibb.co/SXxbj86R/gbv-removebg-preview.png"}
                    alt={"Kitui County GBV"}
                    width={40}
                    height={40}
                    roundedCircle
                />

                {!isCollapsed && (
                    <h6 className="ms-2 mb-0 fw-bold">
                        Kitui County <br />
                        GBV Tool
                    </h6>
                )}
            </div>

            <div className="sidebar-nav flex-grow-1 overflow-auto d-flex flex-column">
                {/* Primary Navigation */}
                <div className="flex-grow-1">{navItems.map(renderNavItem)}</div>

                {/* Secondary Navigation */}
                {secondaryNavItems.length > 0 && (
                    <div className="mt-auto">
                        {!isCollapsed && (
                            <div className="border-top my-2"></div>
                        )}
                        {secondaryNavItems?.map(renderNavItem)}
                    </div>
                )}
            </div>
        </aside>
    );

    return isMobile ? renderMobileSidebar() : renderDesktopSidebar();
}
