import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state.js";
import { facilities } from "../data.js";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "./Loader.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "../styles/ListingDetails.scss";
import { useToast } from "../context/ToastContext";
import { authFetch } from "../utils/api";
import { getImageUrl, handleImageError, getListingFallback, HOST_FALLBACK } from "../utils/imageHelper";

const ListingDetails = () => {
  const user = useSelector((state) => state.user);
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const customerId = useSelector((state) => state?.user?._id);
  const token = useSelector((state) => state.token);
  const wishList = useSelector((state) => state?.user?.wishList || []);

  const getListingDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/properties/${listingId}`,
        { method: "GET" },
      );

      const data = await response.json();
      setListing(data);
    } catch (err) {
      console.log("Fetching Property Details Failed", err.message);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    getListingDetails();
  }, [getListingDetails]);

  const isInWishlist = wishList.some((item) => item._id === listingId);
  const handleAddToWishlist = async () => {
    if (!user) {
      toast.info("Please login to add to wishlist.");
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
      toast.success(
        isInWishlist ? "Removed from wishlist!" : "Added to wishlist!"
      );
    } catch (error) {
      toast.error("Failed to update wishlist.");
    }
  };

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);

  const dayCount = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  const handleSubmit = async () => {
    if (!customerId || !token) {
      toast.info("Please login to make a reservation.");
      return;
    }

    const startDate = new Date(dateRange[0].startDate);
    const endDate = new Date(dateRange[0].endDate);

    if (!startDate || !endDate) {
      toast.info("Please select dates for reservation.");
      return;
    }

    const dayCount = Math.max(1, Math.round(
      (endDate - startDate) / (1000 * 60 * 60 * 24),
    ));

    if (dayCount < 2) {
      toast.error(
        "Please select at least 2 nights for your reservation.",
      );
      return;
    }

    try {
      const bookingForm = {
        listingId,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString()
      };

      const response = await authFetch(
        `${process.env.REACT_APP_API_URL}/bookings/create`,
        token,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingForm),
        },
      );

      if (response.ok) {
        toast.success("Your reservation is confirmed! 🎉");

        setTimeout(() => {
          navigate(`/${customerId}/reservations`);
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(
          data.message || "There was a problem with your reservation.",
        );
      }
    } catch (err) {
      toast.error(
        "An error occurred while submitting your reservation.",
      );
      console.log("Failed to submit reservation.", err.message);
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

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>

          {!isInWishlist && (
            <button
              className="wishlist-button"
              onClick={handleAddToWishlist}
            >
              Add to Wishlist
            </button>
          )}
        </div>

        <div className="photos">
          {[...new Set(listing?.listingPhotoPaths || [])].map((photo, index) => (
            <img
              key={index}
              src={getImageUrl(photo, getListingFallback(index))}
              alt="listing"
              onError={(e) => handleImageError(e, getListingFallback(index))}
            />
          ))}
        </div>

        <h2>
          {listing?.type} in {listing?.city}, {listing?.province},{" "}
          {listing?.country}
        </h2>

        <p>
          {listing?.guestCount} Guests - {listing?.bedroomCount} Bedrooms -{" "}
          {listing?.bedCount} Beds - {listing?.bathroomCount}{" "}
          {listing?.bathroomCount === 1 ? "Bathroom" : "Bathrooms"}
        </p>

        {listing?.creator && (
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
          <p>{listing?.description}</p>

          <hr />

          <h3>Highlights</h3>
          <p>{listing?.highlight}</p>

          <hr />
        </div>

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>

            <div className="amenities">
              {[...new Set((listing?.amenities || []).flatMap((a) => a.split(",")).filter(Boolean))].map(
                (item, index) => (
                  <div className="facility" key={index}>
                    <div className="facility_icon">
                      {
                        facilities.find(
                          (facility) => facility.name === item,
                        )?.icon
                      }
                    </div>

                    <p>{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>

            <div className="date-range-calendar">
              <DateRange
                ranges={dateRange}
                onChange={handleSelect}
                minDate={new Date()}
              />

              {dayCount > 1 ? (
                <h2>
                  ₹{listing?.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ₹{listing?.price} x {dayCount} night
                </h2>
              )}

              <h2>
                Total price: ₹{listing?.price * dayCount}
              </h2>

              <p>
                Start Date:{" "}
                {dateRange[0].startDate.toDateString()}
              </p>

              <p>
                End Date:{" "}
                {dateRange[0].endDate.toDateString()}
              </p>

              <button
                className="button"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();

                  if (!user) {
                    showCustomToast(
                      "Please login to make a reservation.",
                    );
                    return;
                  }

                  handleSubmit();
                }}
              >
                Reserve Your Stay
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
