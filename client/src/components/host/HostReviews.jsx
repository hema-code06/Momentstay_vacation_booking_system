import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Stars from "./Stars";
import { formatDate } from "../../utils/helpers";
import { getImageUrl, handleImageError, AVATAR_FALLBACK } from "../../utils/imageHelper";

const NEW_REVIEW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const isNew = (date) => Date.now() - new Date(date).getTime() < NEW_REVIEW_DAYS * DAY_MS;

const HostReviews = ({ reviews, properties, propertyId, onPropertyChange }) => {
  const [rating, setRating] = useState("all");

  const visible = useMemo(
    () =>
      reviews.filter(
        (review) =>
          (propertyId === "all" || review.listing._id === propertyId) &&
          (rating === "all" || review.rating === Number(rating))
      ),
    [reviews, propertyId, rating]
  );

  return (
    <>
      <div className="host-filters">
        <label>
          Property
          <select value={propertyId} onChange={(e) => onPropertyChange(e.target.value)}>
            <option value="all">All properties</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title} ({property.reviewCount})
              </option>
            ))}
          </select>
        </label>

        <label>
          Rating
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "star" : "stars"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="host-empty">
          <p>
            {reviews.length === 0
              ? "No reviews yet. Reviews from your guests will appear here."
              : "No reviews match these filters."}
          </p>
        </div>
      ) : (
        <div className="host-reviews">
          {visible.map((review) => (
            <article className="host-review" key={review._id}>
              <header>
                <img
                  src={getImageUrl(review.guest?.profileImagePath, AVATAR_FALLBACK)}
                  alt=""
                  onError={(e) => handleImageError(e, AVATAR_FALLBACK)}
                />
                <div>
                  <h3>{review.guest?.username || "Guest"}</h3>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                {isNew(review.createdAt) && <em className="host-badge host-badge--new">New</em>}
              </header>

              <Stars value={review.rating} />
              <p className="comment">{review.comment}</p>
              <Link to={`/feedback/${review.listing._id}`} className="property-link">
                {review.listing.title}
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
};

export default HostReviews;
