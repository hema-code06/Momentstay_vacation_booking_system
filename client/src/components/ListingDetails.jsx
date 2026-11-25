import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { facilities } from "../data";
import Loader from "./Loader";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PaymentModal from "./PaymentModal";
import "../styles/ListingDetails.scss";
import { useToast } from "../context/ToastContext";
import useWishList from "../hooks/useWishList";
import { apiFetch, authFetch } from "../utils/api";
import { nightsBetween, normalizeAmenities } from "../utils/helpers";
import { getImageUrl, handleImageError, getListingFallback, HOST_FALLBACK } from "../utils/imageHelper";

const ListingDetails = () => {
  const { listingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const { isSaved, toggle } = useWishList();

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await apiFetch(`/properties/${listingId}`);
          if (response.ok) {
            if (!ignore) setListing(await response.json());
            break;
          }
          if (response.status === 404) break;
        } catch (err) {
          console.log("Fetching property details failed", err.message);
        }
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
      if (!ignore) setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [listingId]);

  const { startDate, endDate } = dateRange[0];
  const nights = nightsBetween(startDate, endDate);
  const isOwner = Boolean(user) && listing?.creator?._id === user._id;

  const handleWishList = async () => {
    const added = await toggle(listingId);
    if (added !== null) toast.success(added ? "Added to wishlist!" : "Removed from wishlist!");
  };

  const handleReserve = () => {
    if (!user || !token) {
      toast.info("Please login to make a reservation.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (nights < 2) {
      toast.error("Please select at least 2 nights for your reservation.");
      return;
    }

    setShowPayment(true);
  };

  const handlePay = async (paymentMethod) => {
    try {
      const response = await authFetch("/bookings/create", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          startDate: startDate.toDateString(),
          endDate: endDate.toDateString(),
          paymentMethod,
        }),
      });

      if (response.ok) {
        toast.success(
          paymentMethod === "Pay at Property"
            ? "Reservation confirmed. Pay the host when you arrive."
            : "Payment successful. Your reservation is confirmed."
        );
        navigate(`/${user._id}/reservations`);
        return true;
      }

      const data = await response.json().catch(() => ({}));
      toast.error(data.message || "There was a problem with your reservation.");
    } catch (err) {
      console.log("Reservation failed", err.message);
      toast.error("An error occurred while submitting your reservation.");
    }
    return false;
  };

  if (loading) return <Loader />;

  if (!listing?._id) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", padding: "80px 20px" }}>Property not found.</p>
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
          {!isSaved(listing._id) && (
            <button className="wishlist-button" onClick={handleWishList}>
              Add to Wishlist
            </button>
          )}
        </div>

        <div className="photos">
          {[...new Set(listing.listingPhotoPaths)].map((photo, index) => (
            <img
              key={index}
              src={getImageUrl(photo, getListingFallback(index))}
              alt="listing"
              onError={(e) => handleImageError(e, getListingFallback(index))}
            />
          ))}
        </div>

        <h2>
          {listing.type} in <span style={{ color: "#004369", letterSpacing: "0.02em" }}>{listing.city}, {listing.province}, {listing.country}</span>
        </h2>

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

        <div className="booking">
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

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange
                ranges={dateRange}
                onChange={(ranges) => setDateRange([ranges.selection])}
                minDate={new Date()}
              />

              <h2>
                ₹{listing.price} x {nights} {nights === 1 ? "night" : "nights"}
              </h2>
              <h2>Total price: ₹{listing.price * nights}</h2>
              <p>Start Date: {startDate.toDateString()}</p>
              <p>End Date: {endDate.toDateString()}</p>

              {isOwner ? (
                <p>You host this property, so you cannot book it.</p>
              ) : (
                <button className="button" type="button" onClick={handleReserve}>
                  Reserve Your Stay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          summary={{
            title: listing.title,
            dates: `${startDate.toDateString()} to ${endDate.toDateString()}`,
            nights,
            price: listing.price,
            total: listing.price * nights,
          }}
          onClose={() => setShowPayment(false)}
          onPay={handlePay}
        />
      )}

      <Footer />
    </>
  );
};

export default ListingDetails;
