export const CHART_COLORS = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    info: "#0ea5e9",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
    cyan: "#06b6d4",
    orange: "#f97316",
};

export const TRANSACTION_TYPE_CONFIG = {
    deposit: { color: "success", text: "Deposit", icon: "💰" },
    withdrawal: { color: "danger", text: "Withdrawal", icon: "💸" },
    bet: { color: "info", text: "Bet", icon: "🎲" },
    win: { color: "success", text: "Win", icon: "🏆" },
    loss: { color: "danger", text: "Loss", icon: "❌" },
    pending: { color: "warning", text: "Pending", icon: "⏳" },
};

export const STATUS_CONFIG = {
    completed: { color: "success", text: "Completed", icon: "✅" },
    pending: { color: "warning", text: "Pending", icon: "⏳" },
    failed: { color: "danger", text: "Failed", icon: "❌" },
    win: { color: "success", text: "Win", icon: "🏆" },
    loss: { color: "danger", text: "Loss", icon: "💔" },
    void: { color: "secondary", text: "Void", icon: "🚫" },
    active: { color: "success", text: "Active", icon: "✅" },
    suspended: { color: "warning", text: "Suspended", icon: "⚠️" },
    banned: { color: "danger", text: "Banned", icon: "🚫" },
};

export const TIME_RANGES = [
    { value: "today", label: "Today", icon: "⏱️" },
    { value: "week", label: "Week", icon: "📅" },
    { value: "month", label: "Month", icon: "📆" },
    { value: "year", label: "Year", icon: "📊" },
];
