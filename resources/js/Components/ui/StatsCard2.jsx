import { Card, ProgressBar } from "react-bootstrap";
import * as Icons from "react-bootstrap-icons";

const DynamicIcon = ({ icon, size = 24, color = "currentColor" }) => {
    let IconComponent = null;

    // Case 1: icon passed as string ("arrow-left-right")
    if (typeof icon === "string") {
        const name = icon
            .split("-")
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join("");

        IconComponent = Icons[name];
    }

    // Case 2: icon passed as component (Icons.People)
    else if (typeof icon === "function") {
        IconComponent = icon;
    }

    if (!IconComponent) return null;

    return <IconComponent size={size} color={color} />;
};

const StatsCard2 = ({
    title,
    value,
    icon,
    gradient = "primary",
    progress = null,
    progressLabel = null,
    progressTarget = null,
    subtitle = null,
    iconBg = "white",
    iconBgOpacity = "20",
    iconColor = "white",
    textColor = "white",
    className = "",
}) => {
    // Map gradient names to Bootstrap gradient classes
    const gradientClasses = {
        primary: "bg-gradient-primary",
        success: "bg-gradient-success",
        danger: "bg-gradient-danger",
        warning: "bg-gradient-warning",
        info: "bg-gradient-info",
        dark: "bg-gradient-dark",
    };

    const gradientClass = gradientClasses[gradient] || gradientClasses.primary;

    return (
        <Card
            className={`border-0 shadow-sm ${gradientClass} text-white h-100 ${className}`}
        >
            <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                        className="p-3 rounded-3"
                        style={{
                            backgroundColor: `rgba(var(--bs-${iconBg}-rgb), ${iconBgOpacity})`,
                        }}
                    >
                        <DynamicIcon icon={icon} size={24} color={iconColor} />
                    </div>
                    <div>
                        <p className="small opacity-75 mb-1">{title}</p>
                        <h3 className="fw-bold mb-0">
                            {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                        </h3>
                        {subtitle && (
                            <small className="opacity-75">{subtitle}</small>
                        )}
                    </div>
                </div>

                {progress && (
                    <div className="mt-3">
                        {(progressLabel || progressTarget) && (
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                {progressLabel && (
                                    <small className="opacity-75">
                                        {progressLabel}
                                    </small>
                                )}
                                {progressTarget && (
                                    <small className="opacity-75">
                                        {progressTarget}
                                    </small>
                                )}
                            </div>
                        )}
                        <ProgressBar
                            now={progress}
                            variant="white"
                            style={{ height: "4px" }}
                        />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default StatsCard2;
