import React from "react";
import { Badge } from "react-bootstrap";

export default function StatusBadge({ status }) {
    const getStatusVariant = (status) => {
        const variants = {
            reported: "warning",
            under_investigation: "info",
            medical_attention: "purple",
            legal_proceedings: "indigo",
            counselling: "success",
            shelter_provided: "teal",
            concluded: "success",
            closed: "secondary",
            reopened: "warning",
            pending: "warning",
            accepted: "success",
            declined: "danger",
            completed: "success",
            cancelled: "secondary",
        };
        return variants[status] || "secondary";
    };

    return (
        <Badge bg={getStatusVariant(status)}>{status.replace("_", " ")}</Badge>
    );
}
