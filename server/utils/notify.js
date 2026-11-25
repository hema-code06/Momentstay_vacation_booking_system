const Notification = require("../models/Notification");

const formatDay = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const notify = async ({ userId, ...details }) => {
    if (!userId) return;
    try {
        await Notification.create({ userId, ...details });
    } catch (err) {
        console.error("Notification failed:", err.message);
    }
};

module.exports = { notify, formatDay, rupees };
