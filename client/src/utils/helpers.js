const DAY_MS = 24 * 60 * 60 * 1000;

export const nightsBetween = (start, end) =>
  Math.max(1, Math.round((new Date(end) - new Date(start)) / DAY_MS));

export const normalizeAmenities = (raw) => [
  ...new Set(
    [].concat(raw || [])
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean)
  ),
];

export const toCount = (value) => Math.max(parseInt(value, 10) || 1, 1);

export const paymentLabel = ({ paymentStatus, paymentMethod, paymentId, amountPaid }) => {
  if (paymentStatus === "paid") return `Paid via ${paymentMethod}${paymentId ? ` · ${paymentId}` : ""}`;
  if (paymentStatus === "pending") return amountPaid > 0 ? "Balance due at property" : "Pay at property";
  return "";
};

export const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const STAY_LABELS = { upcoming: "Upcoming", ongoing: "Staying now", completed: "Completed" };

export const stayStatus = (start, end) => {
  const now = Date.now();
  if (new Date(end) < now) return "completed";
  if (new Date(start) > now) return "upcoming";
  return "ongoing";
};

export const checkInLabel = (start) => {
  const days = Math.ceil((new Date(start) - Date.now()) / DAY_MS);
  if (days <= 0) return "Check-in today";
  return days === 1 ? "Check-in tomorrow" : `Check-in in ${days} days`;
};

const icsDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
};

const icsText = (text) => String(text || "").replace(/([,;\\])/g, "\\$1");

export const downloadCalendar = ({ title, location, start, end }) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MomentStay//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@momentstay`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART;VALUE=DATE:${icsDate(start)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${icsText(`Stay at ${title}`)}`,
    `LOCATION:${icsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "momentstay-booking.ics";
  link.click();
  URL.revokeObjectURL(url);
};

export const timeAgo = (date) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatDate(date);
};
