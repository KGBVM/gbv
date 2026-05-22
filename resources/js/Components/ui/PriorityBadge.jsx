import React from "react";
import { Badge } from "react-bootstrap";

export default function PriorityBadge({ priority }) {
    const getPriorityVariant = (priority) => {
        const variants = {
            low: "secondary",
            normal: "primary",
            high: "warning",
            critical: "danger",
            routine: "secondary",
            urgent: "warning",
            emergency: "danger",
        };
        return variants[priority] || "secondary";
    };

    return <Badge bg={getPriorityVariant(priority)}>{priority}</Badge>;
}
