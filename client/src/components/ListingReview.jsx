import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  useEffect(() => {
    getListingReview();
  }, [getListingReview]);

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
    if (feedback.rating === 0 || feedback.comment.trim() === "") {
      alert("Please provide a rating and a comment before submitting.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/feedback/create`,
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

      if (response.ok) {
        setFeedback({ rating: 0, comment: "" });
        alert("Thank you for your feedback!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.log(
        "Something went wrong with your feedback submission.",
        err.message,
      );
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
          <button className="button" onClick={handleSubmitFeedback}>
            Submit Feedback
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingReview;