import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { facilities } from "../data";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/UpdateBooking.scss";
import { useToast } from "../context/ToastContext";
import useWishList from "../hooks/useWishList";
import { apiFetch, authFetch } from "../utils/api";
import { nightsBetween, normalizeAmenities } from "../utils/helpers";
import { getImageUrl, handleImageError, getListingFallback, HOST_FALLBACK } from "../utils/imageHelper";

const UpdateBooking = () => {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const { isSaved, toggle } = useWishList();

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const bookingResponse = await authFetch(`/bookings/${bookingId}`, token);
        if (!bookingResponse.ok) throw new Error(`Booking fetch failed: ${bookingResponse.status}`);
        const bookingData = await bookingResponse.json();

        const listingResponse = await apiFetch(`/properties/${bookingData.listingId?._id}`);
        if (!listingResponse.ok) throw new Error(`Listing fetch failed: ${listingResponse.status}`);
        const listingData = await listingResponse.json();

        if (ignore) return;
        setBooking(bookingData);
        setListing(listingData);
        setDateRange([
          {
            startDate: new Date(bookingData.startDate),
            endDate: new Date(bookingData.endDate),
            key: "selection",
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch booking or listing", err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [bookingId, token]);

  const handleWishList = async () => {
    const added = await toggle(listing._id);
    if (added !== null) toast.success(added ? "Added to wishlist!" : "Removed from wishlist!");
  };

  const handleSelect = ({ selection }) => {
    if (selection.startDate && selection.endDate && selection.endDate >= selection.startDate) {
      setDateRange([selection]);
    }
  };

  const handleUpdate = async () => {
    if (!booking || !listing) return;

    try {
      const response = await authFetch(`/bookings/update/${bookingId}`, token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: dateRange[0].startDate.toDateString(),
          endDate: dateRange[0].endDate.toDateString(),
        }),
      });

      if (response.ok) {
        toast.success("Booking updated successfully!");
        navigate(`/${user._id}/reservations`);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || "Failed to update booking.");
      }
    } catch (err) {
      console.error("Update booking failed", err.message);
      toast.error("An error occurred while updating the booking.");
    }
  };

  const oldTotalPrice = booking && listing ? nightsBetween(booking.startDate, booking.endDate) * listing.price : 0;
  const newTotalPrice = listing ? nightsBetween(dateRange[0].startDate, dateRange[0].endDate) * listing.price : 0;

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />

      <div className="update-details">
        <div className="title">
          <h1>{listing?.title}</h1>
          {listing && !isSaved(listing._id) && (
            <button className="wishlist-button" onClick={handleWishList}>
              Add to Wishlist
            </button>
          )}
        </div>

        {listing && (
          <>
            <div className="listing-photos">
              {listing.listingPhotoPaths?.map((photo, index) => (
                <img
                  key={index}
                  src={getImageUrl(photo, getListingFallback(index))}
                  alt={`slide ${index + 1}`}
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

            <div className="profile">
              <img
                src={getImageUrl(listing.creator?.profileImagePath, HOST_FALLBACK)}
                alt="host"
                onError={(e) => handleImageError(e, HOST_FALLBACK)}
              />
              <h3>Hosted by {listing.creator?.username}</h3>
            </div>

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
                <h2>Reschedule Your Stay</h2>
                <div className="date-range-calendar">
                  <DateRange
                    ranges={dateRange}
                    onChange={handleSelect}
                    minDate={new Date()}
                  />
                  <p style={{ fontSize: "17px" }}>Old Price: ₹{oldTotalPrice}</p>
                  <p style={{ fontSize: "17px" }}>New Price: ₹{newTotalPrice}</p>
                  <button onClick={handleUpdate} className="update-button">
                    Update Booking
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default UpdateBooking;
