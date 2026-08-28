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
import { FiCheckCircle } from "react-icons/fi";
import { authFetch } from "../utils/api";

const ListingDetails = () => {
  const user = useSelector((state) => state.user);
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customerId = useSelector((state) => state?.user?._id);
  const token = useSelector((state) => state.token);
  const wishList = useSelector((state) => state?.user?.wishList || []);

  const showCustomToast = (message) => {
    setToastMessage(message);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const getListingDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/properties/${listingId}`,
        { method: "GET" },
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetching Property Details Failed", err.message);
    }
  }, [listingId]);

  useEffect(() => {
    getListingDetails();
  }, [getListingDetails]);

  const isInWishlist = wishList.some((item) => item._id === listingId);
  const handleAddToWishlist = async () => {
    if (!user) {
      showCustomToast("Please login to add to wishlist.");
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
      showCustomToast(
        isInWishlist ? "Removed from wishlist!" : "Added to wishlist!"
      );
    } catch (error) {
      showCustomToast("Failed to update wishlist.");
    }
  };

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);

  const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24));

  const handleSubmit = async () => {
    const startDate = new Date(dateRange[0].startDate);
    const endDate = new Date(dateRange[0].endDate);

    if (!startDate || !endDate) {
      showCustomToast("Please select dates for reservation.");
      return;
    }

    const dayCount = Math.round(
      (endDate - startDate) / (1000 * 60 * 60 * 24),
    );

    if (dayCount < 2) {
      showCustomToast(
        "Please select a start and end date for reservation.",
      );
      return;
    }

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing?.creator?._id,
        startDate: startDate.toDateString(),
        endDate: endDate.toDateString(),
        totalPrice: listing.price * dayCount,
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
        showCustomToast("Your reservation is confirmed!");

        setTimeout(() => {
          navigate(`/${customerId}/reservations`);
        }, 2000);
      } else {
        showCustomToast(
          "There was a problem with your reservation.",
        );
      }
    } catch (err) {
      showCustomToast(
        "An error occurred while submitting your reservation.",
      );
      console.log("Failed to submit reservation.", err.message);
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
          <span>{toastMessage}</span>
        </div>
      )}

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
          {[
            ...new Set(
              listing?.listingPhotoPaths?.map(
                (item) =>
                  item?.startsWith("http")
                    ? item
                    : `${process.env.REACT_APP_API_URL}/${item?.replace(
                      "public",
                      "",
                    )}`,
              ),
            ),
          ].map((uniqueItem, index) => (
            <img key={index} src={uniqueItem} alt={"listing"} />
          ))}
        </div>

        <h2>
          {listing?.type} in {listing?.city}, {listing?.province},{" "}
          {listing?.country}
        </h2>

        <p>
          {listing?.guestCount} Guests - {listing?.bedroomCount} Bedrooms -{" "}
          {listing?.bedCount} Cot - {listing?.bathroomCount} Bathrooms
        </p>

        {listing?.creator && listing.creator.profileImagePath && (
          <div className="profile">
            <img
              src={
                listing.creator.profileImagePath?.startsWith("http")
                  ? listing.creator.profileImagePath
                  : `${process.env.REACT_APP_API_URL}/${listing.creator.profileImagePath?.replace(
                    "public",
                    "",
                  )}`
              }
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

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>

            <div className="amenities">
              {[...new Set(listing?.amenities[0].split(","))].map(
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
