import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import Button from "@mui/material/Button";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import "../styles/TripList.scss";
import { authFetch } from "../utils/api";
import { nightsBetween, paymentLabel, stayStatus, formatDate, STAY_LABELS } from "../utils/helpers";
import { getImageUrl, handleImageError, getListingFallback } from "../utils/imageHelper";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [slideIndexes, setSlideIndexes] = useState({});
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?._id);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    let ignore = false;

    authFetch(`/users/${userId}/trips`, token)
      .then((response) => (response.ok ? response.json() : []))
      .catch((err) => {
        console.log("Fetching trip details failed", err.message);
        return [];
      })
      .then((data) => {
        if (ignore) return;
        setTrips(data.filter((trip) => trip.listingId?._id));
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, token]);

  const moveSlide = (bookingId, step, total) =>
    setSlideIndexes((prev) => ({
      ...prev,
      [bookingId]: ((prev[bookingId] || 0) + step + total) % total,
    }));

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="trip-list-container">
        {trips.length > 0 ? (
          <div className="list">
            {trips.map((trip) => {
              const { _id: bookingId, listingId, startDate, endDate, totalPrice } = trip;
              const currentIndex = slideIndexes[bookingId] || 0;
              const nights = nightsBetween(startDate, endDate);
              const status = stayStatus(startDate, endDate);
              const photos = listingId.listingPhotoPaths || [];
              const location = [listingId.city, listingId.province, listingId.country].filter(Boolean).join(", ");
              return (
                <div key={bookingId} className="trip-card-wrapper">
                  <div
                    className="trip-card"
                    onClick={() => navigate(`/feedback/${listingId._id}`)}
                  >
                    {photos.length > 0 && (
                      <div className="slider-container">
                        <div
                          className="slider"
                          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                          {photos.map((photo, index) => (
                            <div key={index} className="slide">
                              <img
                                src={getImageUrl(photo, getListingFallback(index))}
                                alt={`${index + 1}`}
                                onError={(e) => handleImageError(e, getListingFallback(index))}
                              />
                            </div>
                          ))}
                        </div>

                        {photos.length > 1 && (
                          <>
                            <div
                              className="prev-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(bookingId, -1, photos.length);
                              }}
                            >
                              <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                            </div>
                            <div
                              className="next-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(bookingId, 1, photos.length);
                              }}
                            >
                              <ArrowForwardIos sx={{ fontSize: "15px" }} />
                            </div>

                            <div className="photo-dots">
                              {photos.map((_, i) => (
                                <span
                                  key={i}
                                  className={`dot ${i === currentIndex ? "active" : ""}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="info">
                      <span className="status-badge">
                        <CheckCircleOutlineIcon fontSize="small" />
                        {STAY_LABELS[status]}
                      </span>

                      <h3>{listingId.title}</h3>

                      {location && (
                        <p className="location">
                          <LocationOnOutlinedIcon fontSize="small" />
                          {location}
                        </p>
                      )}

                      <div className="dates">
                        <div>
                          <span className="label">Check-in</span>
                          <strong>{formatDate(startDate)}</strong>
                        </div>
                        <ArrowForwardIcon className="arrow-icon" fontSize="small" />
                        <div>
                          <span className="label">Check-out</span>
                          <strong>{formatDate(endDate)}</strong>
                        </div>
                      </div>

                      <p className="duration">
                        <NightsStayOutlinedIcon fontSize="small" />
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>

                      <div className="price">
                        <span>₹{Number(totalPrice).toLocaleString("en-IN")}</span>
                        <span className="hint">incl. taxes &amp; fees</span>
                      </div>

                      {paymentLabel(trip) && <p className="payment-note">{paymentLabel(trip)}</p>}

                      <div className="trip-actions">
                        {status === "completed" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/feedback/${listingId._id}`);
                            }}
                          >
                            Write a review
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/${userId}/reservations`);
                            }}
                          >
                            Manage reservation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-trip-list">
            <div className="empty-icon">
              <LuggageOutlinedIcon />
            </div>
            <h2>Your next adventure starts here..</h2>
            <p>
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Button
              variant="contained"
              className="trip-btn"
              onClick={() => navigate("/")}
            >
              Find Your Destination
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TripList;