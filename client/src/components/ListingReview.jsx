import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state.js";
import { facilities } from "../data.js";
import { FaStar } from "react-icons/fa";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ListingReview.scss";
import { FiCheckCircle } from "react-icons/fi";
import { authFetch } from "../utils/api";

const ListingReview = () => {
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const [listing, setListing] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: "",
  });
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const wishList = useSelector((state) => state?.user?.wishList || []);

  const getListingReview = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/properties/${listingId}`
      );
      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [listingId]);

  const getReviews = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/reviews/listing/${listingId}`
      );
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      console.log(err);
    }
  }, [listingId]);

  useEffect(() => {
    getListingReview();
    getReviews();
  }, [getListingReview, getReviews]);

  const isInWishlist = wishList.some((item) => item._id === listingId);

  const handleAddToWishlist = async () => {
    if (!user) {
      alert("Please login to add to wishlist.");
      return;
    }
    try {
      const response = await authFetch(
        `${process.env.REACT_APP_API_URL}/users/${user._id}/${listingId}`,
        token,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      dispatch(setWishList(data.wishList));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (error) {
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handleStarClick = (rating) => {
    setFeedback((prev) => ({ ...prev, rating }));
  };

  const handleChange = (e) => {
    setFeedback((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitFeedback = async () => {
    setReviewError("");

    if (!user) {
      setReviewError("Please login to leave a review.");
      return;
    }

    if (feedback.rating === 0 || feedback.comment.trim() === "") {
      setReviewError("Please provide a rating and a comment before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authFetch(
        `${process.env.REACT_APP_API_URL}/reviews/create`,
        token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId,
            rating: feedback.rating,
            comment: feedback.comment,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setFeedback({ rating: 0, comment: "" });
        setReviews((prev) => [data, ...prev]);
        setTotalReviews((prev) => prev + 1);
        setAverageRating((prevAvg) => {
          const newTotal = totalReviews + 1;
          return Math.round(((prevAvg * totalReviews + data.rating) / newTotal) * 10) / 10;
        });
      } else {
        setReviewError(data.message || "Failed to submit your review.");
      }
    } catch (err) {
      setReviewError("Something went wrong with your review submission.");
      console.log(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      {showToast && (
        <div className="custom-toast">
          <FiCheckCircle className="toast-icon" />
          <span>Added to wishlist successfully!</span>
        </div>
      )}
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
          {!isInWishlist && (
            <button className="wishlist-button" onClick={handleAddToWishlist}>
              Add to Wishlist
            </button>
          )}
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={item?.startsWith("http") ? item : `${process.env.REACT_APP_API_URL}/${item?.replace("public", "")}`}
              alt="listing"
              key={item}
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} Guests - {listing.bedroomCount} Bedrooms -{" "}
          {listing.bedCount} Cot - {listing.bathroomCount} Bathroom
        </p>

        {listing?.creator && listing.creator.profileImagePath && (
          <div className="profile">
            <img
              src={listing.creator.profileImagePath?.startsWith("http") ? listing.creator.profileImagePath : `${process.env.REACT_APP_API_URL}/${listing.creator.profileImagePath?.replace("public", "")}`}
              alt="host"
            />
            <h3>Hosted by {listing.creator.username}</h3>
          </div>
        )}

        <div className="info">
          <h3>Description</h3>
          <p>{listing?.description}</p>
          <hr />

          <h3>Highlights</h3>
          <p>{listing?.highlight}</p>
          <hr />
        </div>

        <div>
          <h2>What this place offers?</h2>
          <div className="amenities">
            {[...new Set((listing?.amenities?.[0] || "").split(",").filter(Boolean))].map(
              (item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ),
            )}
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
                  src={
                    review.userId?.profileImagePath
                      ? review.userId.profileImagePath
                      : "/default-avatar.png"
                  }
                  alt={review.userId?.username || "Guest"}
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