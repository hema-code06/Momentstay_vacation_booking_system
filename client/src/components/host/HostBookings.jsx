import { useMemo, useState } from "react";
import { formatDate, rupees, STAY_LABELS } from "../../utils/helpers";
import { getImageUrl, handleImageError, AVATAR_FALLBACK } from "../../utils/imageHelper";

const paymentState = (booking) => {
  if (booking.paymentStatus === "paid") return { text: "Paid", tone: "paid" };
  if (booking.paymentStatus === "pending") {
    return { text: `Balance ${rupees(booking.dueAmount)} due`, tone: "due" };
  }
  return { text: "Not recorded", tone: "none" };
};

const safeCell = (value) => {
  const text = String(value ?? "");
  return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
};

const exportCsv = (rows) => {
  const header = [
    "Guest", "Email", "Property", "Check-in", "Check-out", "Nights",
    "Total", "Paid", "Balance due", "Payment method", "Payment reference", "Stay status",
  ];
  const lines = rows.map((b) => [
    b.guest?.username, b.guest?.email, b.listing.title, formatDate(b.startDate), formatDate(b.endDate),
    b.nights, b.totalPrice, b.paidAmount, b.dueAmount, b.paymentMethod, b.paymentId, STAY_LABELS[b.status],
  ]);
  const csv = [header, ...lines].map((row) => row.map(safeCell).join(",")).join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "momentstay-bookings.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const HostBookings = ({ bookings, properties, onCollect, onCancel }) => {
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [propertyId, setPropertyId] = useState("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (status !== "all" && booking.status !== status) return false;
      if (propertyId !== "all" && booking.listing._id !== propertyId) return false;
      if (payment !== "all" && paymentState(booking).tone !== payment) return false;
      if (!term) return true;
      return [booking.guest?.username, booking.guest?.email, booking.listing.title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [bookings, status, payment, propertyId, search]);

  if (bookings.length === 0) {
    return (
      <div className="host-empty">
        <h3>No bookings yet</h3>
        <p>When a guest books one of your properties, it will appear here with payment details.</p>
      </div>
    );
  }

  return (
    <>
      <div className="host-filters">
        <input
          type="search"
          placeholder="Search guest or property"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Stay status">
          <option value="all">All stays</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Staying now</option>
          <option value="completed">Completed</option>
        </select>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Payment">
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="due">Balance due</option>
          <option value="none">Not recorded</option>
        </select>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} aria-label="Property">
          <option value="all">All properties</option>
          {properties.map((property) => (
            <option key={property._id} value={property._id}>
              {property.title}
            </option>
          ))}
        </select>
        <button type="button" className="host-button host-button--ghost" onClick={() => exportCsv(visible)}>
          Export CSV
        </button>
      </div>

      <p className="host-count">
        {visible.length} {visible.length === 1 ? "booking" : "bookings"}
      </p>

      {visible.length === 0 ? (
        <div className="host-empty">
          <p>No bookings match these filters.</p>
        </div>
      ) : (
        <div className="host-bookings">
          {visible.map((booking) => {
            const pay = paymentState(booking);
            return (
              <article className="host-booking" key={booking._id}>
                <div className="host-booking__guest">
                  <img
                    src={getImageUrl(booking.guest?.profileImagePath, AVATAR_FALLBACK)}
                    alt=""
                    onError={(e) => handleImageError(e, AVATAR_FALLBACK)}
                  />
                  <div>
                    <strong>{booking.guest?.username || "Guest"}</strong>
                    {booking.guest?.email && <a href={`mailto:${booking.guest.email}`}>{booking.guest.email}</a>}
                  </div>
                </div>

                <div className="host-booking__stay">
                  <strong>{booking.listing.title}</strong>
                  <span>
                    {formatDate(booking.startDate)} to {formatDate(booking.endDate)} · {booking.nights}{" "}
                    {booking.nights === 1 ? "night" : "nights"}
                  </span>
                  <em className={`host-badge host-badge--${booking.status}`}>{STAY_LABELS[booking.status]}</em>
                </div>

                <div className="host-booking__payment">
                  <strong>{rupees(booking.totalPrice)}</strong>
                  <em className={`host-badge host-badge--${pay.tone}`}>{pay.text}</em>
                  {booking.paymentMethod && (
                    <span>
                      {booking.paymentMethod}
                      {booking.paymentId ? ` · ${booking.paymentId}` : ""}
                    </span>
                  )}
                  {booking.paidAt && <span>Paid on {formatDate(booking.paidAt)}</span>}
                </div>

                <div className="host-booking__actions">
                  {booking.paymentStatus === "pending" && (
                    <button type="button" onClick={() => onCollect(booking._id)}>
                      Confirm payment
                    </button>
                  )}
                  {booking.status !== "completed" && (
                    <button type="button" className="danger" onClick={() => onCancel(booking._id)}>
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};

export default HostBookings;
