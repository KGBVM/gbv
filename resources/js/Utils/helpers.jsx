export function formatDate(date, format = "DD/MM/YYYY") {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    const hours24 = d.getHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? "PM" : "AM";

    const hours = String(hours12).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return format
        .replace("YYYY", year)
        .replace("MM", month)
        .replace("DD", day)
        .replace("HH", hours)
        .replace("mm", minutes)
        .replace("A", ampm);
}

export function formatTime(date, format = "HH:mm A") {
    return formatDate(date, format);
}

export function formatDateTime(date, format = "DD/MM/YYYY HH:mm A") {
    return formatDate(date, format);
}

export function formatFetchDate(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatCurrency(amount, currency = "KES") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toFixed(value, decimals = 2) {
    if (typeof value !== "number") return value;
    return Number(value.toFixed(decimals));
}

export function getUserAvatar(user) {
    if (user?.avatar) return user.avatar;

    const name = user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
}

export function getWalletName(wallet) {
    return wallet.charAt(0).toUpperCase() + wallet.slice(1).toLowerCase();
}
