import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import "../styles/ReservationList.scss";
import { useToast } from "../context/ToastContext";
import { authFetch } from "../utils/api";
import {
  nightsBetween,
  paymentLabel,
  stayStatus,
  formatDate,
  checkInLabel,
  downloadCalendar,
  STAY_LABELS,
} from "../utils/helpers";
import { getImageUrl, handleImageError, getListingFallback } from "../utils/imageHelper";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [slideIndexMap, setSlideIndexMap] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();
  const userId = useSelector((state) => state.user?._id);
  const token = useSelector((state) => state.token);

  const loadReservations = useCallback(async () => {
    try {
      const response = await authFetch(`/users/${userId}/reservations`, token);
      if (!response.ok) throw new Error("Failed to fetch reservations");
      const data = await response.json();
      setReservations(
        data.filter((booking) => booking.listingId?._id && booking.customerId?._id === userId)
      );
    } catch (err) {
      console.log("Fetching reservations failed", err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const moveSlide = (bookingId, step, total) =>
    setSlideIndexMap((prev) => ({
      ...prev,
      [bookingId]: ((prev[bookingId] || 0) + step + total) % total,
    }));

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this reservation? This cannot be undone.")) return;

    setCancellingId(bookingId);
    try {
      const response = await authFetch(`/bookings/delete/${bookingId}`, token, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message);

      toast.success(
        data.refundAmount > 0
          ? `Reservation cancelled. ₹${data.refundAmount.toLocaleString("en-IN")} will be refunded (demo).`
          : "Reservation cancelled."
      );
      await loadReservations();
    } catch (err) {
      toast.error(err.message || "Could not cancel the reservation. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="reserve-container">
        <div className="reservation-header">
          {reservations.length > 0 && (
            <span className="reservation-count">
              {reservations.length}{" "}
              {reservations.length === 1 ? "Booking" : "Bookings"}
            </span>
          )}
          <p className="reservation-hint">
            Bookings on your own properties are in the <Link to="/host?tab=bookings">Host dashboard</Link>.
          </p>
        </div>

        {reservations.length > 0 ? (
          <div className="reservation-list">
            {reservations.map((reservation) => {
              const { _id, listingId, startDate, endDate, totalPrice } = reservation;
              const dayCount = nightsBetween(startDate, endDate);
              const status = stayStatus(startDate, endDate);
              const price = totalPrice ?? (listingId.price || 0) * dayCount;
              const photos = listingId.listingPhotoPaths || [];
              const currentSlide = slideIndexMap[_id] || 0;

              return (
                <div className="reservation-card" key={_id}>
                  <div className="card-image">
                    <div
                      className="slider-track"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {photos.map((photo, i) => (
                        <div className="slide" key={i}>
                          <img
                            src={getImageUrl(photo, getListingFallback(i))}
                            alt={`${listingId.title} - ${i + 1}`}
                            onError={(e) => handleImageError(e, getListingFallback(i))}
                          />
                        </div>
                      ))}
                    </div>

                    {photos.length > 1 && (
                      <>
                        <button
                          className="slide-btn prev"
                          onClick={() => moveSlide(_id, -1, photos.length)}
                          aria-label="Previous photo"
                        >
                          <ArrowBackIosNew sx={{ fontSize: "12px" }} />
                        </button>
                        <button
                          className="slide-btn next"
                          onClick={() => moveSlide(_id, 1, photos.length)}
                          aria-label="Next photo"
                        >
                          <ArrowForwardIos sx={{ fontSize: "12px" }} />
                        </button>
                        <div className="slide-dots">
                          {photos.map((_, i) => (
                            <span key={i} className={`dot ${i === currentSlide ? "active" : ""}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="card-main">
                      <span className={`stay-chip stay-chip--${status}`}>
                        {status === "upcoming" ? checkInLabel(startDate) : STAY_LABELS[status]}
                      </span>
                      <h2 className="listing-title">{listingId.title}</h2>

                      <div className="detail-row">
                        <LocationOnOutlinedIcon className="detail-icon" />
                        <span>
                          {listingId.city}
                          {listingId.country ? `, ${listingId.country}` : ""}
                        </span>
                      </div>

                      <div className="detail-row">
                        <CalendarTodayOutlinedIcon className="detail-icon" />
                        <span>
                          {formatDate(startDate)} — {formatDate(endDate)}
                        </span>
                      </div>

                      <div className="detail-row">
                        <NightsStayOutlinedIcon className="detail-icon" />
                        <span>
                          {dayCount} {dayCount === 1 ? "Night" : "Nights"}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="price-block">
                        <span className="price-label">Total</span>
                        <span className="price-value">₹{price.toLocaleString("en-IN")}</span>
                        {paymentLabel(reservation) && (
                          <span className="payment-note">{paymentLabel(reservation)}</span>
                        )}
                      </div>

                      <div className="action-icons">
                        {status === "completed" ? (
                          <button
                            className="review-btn"
                            onClick={() => navigate(`/feedback/${listingId._id}`)}
                          >
                            Write a review
                          </button>
                        ) : (
                          <>
                            <button
                              className="icon-btn calendar-btn"
                              onClick={() =>
                                downloadCalendar({
                                  title: listingId.title,
                                  location: [listingId.city, listingId.country].filter(Boolean).join(", "),
                                  start: startDate,
                                  end: endDate,
                                })
                              }
                              aria-label="Add to calendar"
                              title="Add to calendar"
                            >
                              <CalendarMonthOutlinedIcon />
                            </button>
                            <button
                              className="icon-btn edit-btn"
                              onClick={() => navigate(`/bookings/update/${_id}`)}
                              aria-label="Edit booking"
                              title="Change dates"
                            >
                              <EditOutlinedIcon />
                            </button>
                            <button
                              className={`icon-btn delete-btn ${cancellingId === _id ? "loading" : ""}`}
                              onClick={() => handleCancelBooking(_id)}
                              aria-label="Cancel booking"
                              title="Cancel reservation"
                              disabled={cancellingId === _id}
                            >
                              <DeleteOutlineOutlinedIcon />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <EventAvailableOutlinedIcon />
            </div>
            <h2>No bookings Yet</h2>
            <p>You haven't made any bookings. Find your perfect stay and reserve it today.</p>
            <button className="start-btn" onClick={() => navigate("/")}>
              Explore Properties
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ReservationList;