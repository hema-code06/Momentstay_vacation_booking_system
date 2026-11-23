import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import { facilities } from "../data";
import Loader from "./Loader";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/ListingReview.scss";
import { useToast } from "../context/ToastContext";
import useWishList from "../hooks/useWishList";
import { apiFetch, authFetch } from "../utils/api";
import { normalizeAmenities } from "../utils/helpers";
import {
  getImageUrl,
  handleImageError,
  getListingFallback,
  HOST_FALLBACK,
  AVATAR_FALLBACK,
} from "../utils/imageHelper";

const ListingReview = () => {
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 0, comment: "" });
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const { isSaved, toggle } = useWishList();

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const [listingResponse, reviewResponse] = await Promise.all([
          apiFetch(`/properties/${listingId}`),
          apiFetch(`/reviews/listing/${listingId}`),
        ]);
        if (ignore) return;

        if (listingResponse.ok) setListing(await listingResponse.json());
        if (reviewResponse.ok) {
          const data = await reviewResponse.json();
          setReviews(data.reviews || []);
          setAverageRating(data.averageRating || 0);
          setTotalReviews(data.totalReviews || 0);
        }
      } catch (err) {
        console.log("Fetching listing reviews failed", err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [listingId]);

  const handleWishList = async () => {
    const added = await toggle(listingId);
    if (added !== null) toast.success(added ? "Added to wishlist!" : "Removed from wishlist!");
  };

  const handleStarClick = (rating) => {
    setFeedback((prev) => ({ ...prev, rating }));
  };

  const handleChange = (e) => {
    setFeedback((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitFeedback = async () => {
    setReviewError("");

    if (!user || !token) {
      toast.info("Please login to leave a review.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (feedback.rating === 0 || feedback.comment.trim() === "") {
      setReviewError("Please provide a rating and a comment before submitting.");
      toast.error("Please provide a rating and comment.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authFetch("/reviews/create", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, rating: feedback.rating, comment: feedback.comment }),
      });

      const data = await response.json();

      if (response.ok) {
        const updated = [data, ...reviews.filter((review) => review._id !== data._id)];
        const total = updated.reduce((sum, review) => sum + review.rating, 0);
        setFeedback({ rating: 0, comment: "" });
        setReviews(updated);
        setTotalReviews(updated.length);
        setAverageRating(Math.round((total / updated.length) * 10) / 10);
        toast.success("Review submitted successfully!");
      } else {
        setReviewError(data.message || "Failed to submit your review.");
        toast.error(data.message || "Failed to submit your review.");
      }
    } catch (err) {
      console.log("Review submission failed", err.message);
      setReviewError("Something went wrong with your review submission.");
      toast.error("Something went wrong with your review submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (!listing?._id) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", padding: "80px 20px" }}>
          Property not found.
        </p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="listing-reviews">
        <div className="title">
          <h1>{listing.title}</h1>
          {totalReviews > 0 && (
            <div className="rating-summary">
              <FaStar className="star filled" />
              <span>{averageRating}</span>
              <span className="review-count">
                ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
          {!isSaved(listing._id) && (
            <button className="wishlist-button" onClick={handleWishList}>
              Add to Wishlist
            </button>
          )}
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((photo, index) => (
            <img
              src={getImageUrl(photo, getListingFallback(index))}
              alt="listing"
              key={index}
              onError={(e) => handleImageError(e, getListingFallback(index))}
            />
          ))}
        </div>

        <h3 style={{ letterSpacing: "0.02em" }}>
          <span style={{ color: "#004369" }}>{listing.type}</span> in {listing.city}, {listing.province}, {listing.country}
        </h3>
        <p>
          {listing.guestCount} Guests - {listing.bedroomCount} Bedrooms - {listing.bedCount} Beds -{" "}
          {listing.bathroomCount} {listing.bathroomCount === 1 ? "Bathroom" : "Bathrooms"}
        </p>

        {listing.creator && (
          <div className="profile">
            <img
              src={getImageUrl(listing.creator.profileImagePath, HOST_FALLBACK)}
              alt="host"
              onError={(e) => handleImageError(e, HOST_FALLBACK)}
            />
            <h3>Hosted by {listing.creator.username}</h3>
          </div>
        )}

        <div className="info">
          <h3>Description</h3>
          <p>{listing.description}</p>
          <hr />

          <h3>Highlights</h3>
          <p>{listing.highlight}</p>
          <hr />
        </div>

        <div>
          <h2>What this place offers?</h2>
          <div className="amenities">
            {normalizeAmenities(listing.amenities).map((item) => (
              <div className="facility" key={item}>
                <div className="facility_icon">
                  {facilities.find((facility) => facility.name === item)?.icon}
                </div>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="feedback-form">
          <h2>Leave Feedback</h2>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${feedback.rating >= star ? "filled" : ""}`}
                onClick={() => handleStarClick(star)}
              />
            ))}
          </div>
          <textarea
            name="comment"
            placeholder="Leave a comment"
            value={feedback.comment}
            onChange={handleChange}
          />
          {reviewError && <p className="review-error">{reviewError}</p>}
          <button
            className="button"
            onClick={handleSubmitFeedback}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>

        <div className="reviews-list">
          <h2>
            {totalReviews > 0
              ? `${totalReviews} ${totalReviews === 1 ? "Review" : "Reviews"}`
              : "No reviews yet"}
          </h2>
          {reviews.map((review) => (
            <div className="review-card" key={review._id}>
              <div className="review-header">
                <img
                  src={getImageUrl(review.userId?.profileImagePath, AVATAR_FALLBACK)}
                  alt={review.userId?.username || "Guest"}
                  onError={(e) => handleImageError(e, AVATAR_FALLBACK)}
                />
                <div>
                  <h4>{review.userId?.username || "Guest"}</h4>
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`star ${review.rating >= star ? "filled" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingReview;