import { useEffect, useState, useCallback, useMemo } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../redux/state";
import { useNavigate } from "react-router-dom";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import "../styles/ReservationList.scss";

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const [slideIndexMap, setSlideIndexMap] = useState({});
  const [cancellingId, setCancellingId] = useState(null);

  const userId = useSelector((state) => state.user._id);
  const reservationList = useSelector((state) => state.user.reservationList || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getReservationList = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}/reservations`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error("Failed to fetch reservations");
      const data = await response.json();
      dispatch(setReservationList(data));
    } catch (err) {
      console.log("Fetch Reservation List failed!", err.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    getReservationList();
  }, [getReservationList]);

  const filteredReservationList = useMemo(
    () => reservationList.filter((b) => b.listingId && b.listingId._id),
    [reservationList]
  );

  const goToPrevSlide = (bookingId, totalSlides) => {
    setSlideIndexMap((prev) => ({
      ...prev,
      [bookingId]: (prev[bookingId] || 0) > 0 ? (prev[bookingId] || 0) - 1 : totalSlides - 1,
    }));
  };

  const goToNextSlide = (bookingId, totalSlides) => {
    setSlideIndexMap((prev) => ({
      ...prev,
      [bookingId]: (prev[bookingId] || 0) < totalSlides - 1 ? (prev[bookingId] || 0) + 1 : 0,
    }));
  };

  const handleUpdateBooking = (booking) => navigate(`/bookings/update/${booking._id}`);

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/delete/${bookingId}`,
        { method: "DELETE" }
      );
      if (response.ok) await getReservationList();
    } catch (err) {
      console.log("Cancel Booking Failed.", err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const calculateDayCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="reserve-container">
        <div className="reservation-header">
          <h1 className="page-title">My Reservations</h1>
          {filteredReservationList.length > 0 && (
            <span className="reservation-count">
              {filteredReservationList.length}{" "}
              {filteredReservationList.length === 1 ? "Booking" : "Bookings"}
            </span>
          )}
        </div>

        {filteredReservationList.length > 0 ? (
          <div className="reservation-list">
            {filteredReservationList.map((booking) => {
              if (!booking?.listingId) return null;

              const { listingId, startDate, endDate, totalPrice, _id } = booking;
              const dayCount = calculateDayCount(startDate, endDate);
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
                            src={
                              photo?.startsWith("http")
                                ? photo
                                : `${process.env.REACT_APP_API_URL}/${photo?.replace("public", "")}`
                            }
                            alt={`${listingId.title} - ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    {photos.length > 1 && (
                      <>
                        <button
                          className="slide-btn prev"
                          onClick={() => goToPrevSlide(_id, photos.length)}
                          aria-label="Previous photo"
                        >
                          <ArrowBackIosNew sx={{ fontSize: "12px" }} />
                        </button>
                        <button
                          className="slide-btn next"
                          onClick={() => goToNextSlide(_id, photos.length)}
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
                      </div>

                      <div className="action-icons">
                        <button
                          className="icon-btn edit-btn"
                          onClick={() => handleUpdateBooking(booking)}
                          aria-label="Edit booking"
                          title="Edit Booking"
                        >
                          <EditOutlinedIcon />
                        </button>
                        <button
                          className={`icon-btn delete-btn ${cancellingId === _id ? "loading" : ""}`}
                          onClick={() => handleCancelBooking(_id)}
                          aria-label="Cancel booking"
                          title="Cancel Booking"
                          disabled={cancellingId === _id}
                        >
                          <DeleteOutlineOutlinedIcon />
                        </button>
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
            <h2>No Reservations Yet</h2>
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