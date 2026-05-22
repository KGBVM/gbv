import { Card, Badge } from "react-bootstrap";
import * as Icons from "react-bootstrap-icons";

const DynamicIcon = ({ icon, size = 28, color }) => {
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

const StatsCard = ({
    title,
    value,
    icon,
    trend,
    color = "primary",
    subtitle,
}) => {
    return (
        <Card className="border-0 shadow-sm hover-shadow transition-all h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-secondary small fw-semibold mb-1 text-uppercase">
                            {title}
                        </p>

                        <h4 className="fw-bold mb-0">
                            {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                        </h4>

                        {subtitle && (
                            <small className="text-secondary">{subtitle}</small>
                        )}
                    </div>

                    <div
                        className={`p-3 rounded-3 bg-${color} bg-opacity-25 text-${color}`}
                    >
                        <DynamicIcon icon={icon} size={28} />
                    </div>
                </div>

                {trend && (
                    <div className="d-flex align-items-center gap-2 mt-3">
                        <Badge
                            bg={trend.positive ? "success" : "danger"}
                            className="rounded-pill d-flex align-items-center gap-1 px-2 py-1"
                        >
                            {trend.positive ? (
                                <Icons.ArrowUpRight size={14} />
                            ) : (
                                <Icons.ArrowDownRight size={14} />
                            )}
                            {trend.value}%
                        </Badge>

                        <small className="text-secondary">vs last month</small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default StatsCard;
