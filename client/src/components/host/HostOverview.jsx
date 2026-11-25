import { Link } from "react-router-dom";
import Stars from "./Stars";
import { formatDate, rupees } from "../../utils/helpers";
import { getImageUrl, handleImageError, AVATAR_FALLBACK } from "../../utils/imageHelper";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysUntil = (date) => {
  const days = Math.ceil((new Date(date) - Date.now()) / DAY_MS);
  if (days <= 0) return "today";
  return days === 1 ? "tomorrow" : `in ${days} days`;
};

const HostOverview = ({ stats, bookings, reviews, onTab }) => {
  const upcoming = bookings
    .filter((booking) => booking.status === "upcoming")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);
  const staying = bookings.filter((booking) => booking.status === "ongoing");

  const cards = [
    { label: "Earnings", value: rupees(stats.totalEarnings), note: "Payments received" },
    { label: "Due at property", value: rupees(stats.dueAtProperty), note: "Balance to collect" },
    {
      label: "Bookings",
      value: stats.totalBookings,
      note: `${stats.upcomingBookings} upcoming, ${stats.ongoingBookings} staying now`,
    },
    { label: "Properties", value: stats.properties, note: "Listed by you" },
    {
      label: "Rating",
      value: stats.totalReviews ? stats.averageRating.toFixed(1) : "-",
      note: `${stats.totalReviews} ${stats.totalReviews === 1 ? "review" : "reviews"}`,
    },
  ];

  return (
    <>
      <div className="host-stats">
        {cards.map((card) => (
          <div className="host-stat" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </div>
        ))}
      </div>

      <div className="host-columns">
        <section className="host-panel">
          <div className="host-panel__head">
            <h3>Upcoming check-ins</h3>
            <button type="button" onClick={() => onTab("bookings")}>
              All bookings
            </button>
          </div>

          {staying.length > 0 && (
            <p className="host-note">
              {staying.length} {staying.length === 1 ? "guest is" : "guests are"} staying right now.
            </p>
          )}

          {upcoming.length === 0 ? (
            <p className="host-empty-small">No upcoming check-ins.</p>
          ) : (
            <ul className="host-list">
              {upcoming.map((booking) => (
                <li key={booking._id}>
                  <img
                    src={getImageUrl(booking.guest?.profileImagePath, AVATAR_FALLBACK)}
                    alt=""
                    onError={(e) => handleImageError(e, AVATAR_FALLBACK)}
                  />
                  <div>
                    <strong>{booking.guest?.username || "Guest"}</strong>
                    <span>
                      {booking.listing.title} · {formatDate(booking.startDate)} to{" "}
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                  <em>{daysUntil(booking.startDate)}</em>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="host-panel">
          <div className="host-panel__head">
            <h3>Latest reviews</h3>
            <button type="button" onClick={() => onTab("reviews")}>
              All reviews
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="host-empty-small">No reviews yet.</p>
          ) : (
            <ul className="host-list host-list--reviews">
              {reviews.slice(0, 3).map((review) => (
                <li key={review._id}>
                  <div>
                    <strong>{review.guest?.username || "Guest"}</strong>
                    <Stars value={review.rating} />
                    <p>{review.comment}</p>
                    <Link to={`/feedback/${review.listing._id}`}>{review.listing.title}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default HostOverview;
