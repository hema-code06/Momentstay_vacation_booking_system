import { useEffect, useState, useCallback } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import { useNavigate } from "react-router-dom";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import Button from "@mui/material/Button";
import "../styles/TripList.scss";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);
  const tripList = useSelector((state) => state.user.tripList);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentIndexes, setCurrentIndexes] = useState({});

  const getTripList = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}/trips`,
        { method: "GET" }
      );
      const data = await response.json();
      dispatch(setTripList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetching Trip journal details failed!!", err.message);
      setLoading(false);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    getTripList();
  }, [getTripList]);

  const filteredTripList = (tripList || []).filter(
    (trip) => trip.listingId && trip.listingId._id
  );

  const goToPrevSlide = (listingId) => {
    if (!listingId || !listingId._id) return;
    setCurrentIndexes((prev) => {
      const current = prev[listingId._id] || 0;
      const trip = filteredTripList.find(
        (t) => t.listingId?._id === listingId._id
      );
      const total = trip?.listingId?.listingPhotoPaths?.length || 1;
      return { ...prev, [listingId._id]: current === 0 ? total - 1 : current - 1 };
    });
  };

  const goToNextSlide = (listingId) => {
    if (!listingId || !listingId._id) return;
    setCurrentIndexes((prev) => {
      const current = prev[listingId._id] || 0;
      const trip = filteredTripList.find(
        (t) => t.listingId?._id === listingId._id
      );
      const total = trip?.listingId?.listingPhotoPaths?.length || 1;
      return { ...prev, [listingId._id]: current === total - 1 ? 0 : current + 1 };
    });
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const calcNights = (start, end) =>
    Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

  const handleStartSearching = () => navigate("/");
  const handleCardClick = (listingId) => navigate(`/feedback/${listingId}`);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="trip-list-container">

        {filteredTripList.length > 0 ? (
          <div className="list">
            {filteredTripList.map(({ listingId, startDate, endDate, totalPrice }) => {
              if (!listingId || !listingId._id) return null;

              const currentIndex = currentIndexes[listingId._id] || 0;
              const nights = calcNights(startDate, endDate);
              const photos = listingId?.listingPhotoPaths || [];
              const location = listingId?.address          
                || listingId?.location                     
                || [listingId?.city, listingId?.state, listingId?.country].filter(Boolean).join(", ");

              return (
                <div key={listingId._id} className="trip-card-wrapper">
                  <div
                    className="listing-card"
                    onClick={() => handleCardClick(listingId._id)}
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
                                src={
                                  photo?.startsWith("http")
                                    ? photo
                                    : `${process.env.REACT_APP_API_URL}/${photo?.replace("public", "")}`
                                }
                                alt={`${index + 1}`}
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
                                goToPrevSlide(listingId);
                              }}
                            >
                              <ArrowBackIosNew sx={{ fontSize: "15px" }} />
                            </div>
                            <div
                              className="next-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNextSlide(listingId);
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
                        <i className="ti ti-circle-check" aria-hidden="true" />
                        Confirmed
                      </span>

                      <h3>{listingId?.title}</h3>

                      {location && (
                        <p className="location">
                          <i className="ti ti-map-pin" aria-hidden="true" />
                          {location}
                        </p>
                      )}

                      <div className="dates">
                        <div>
                          <span className="label">Check-in</span>
                          <strong>{formatDate(startDate)}</strong>
                        </div>
                        <i className="ti ti-arrow-right arrow-icon" aria-hidden="true" />
                        <div>
                          <span className="label">Check-out</span>
                          <strong>{formatDate(endDate)}</strong>
                        </div>
                      </div>

                      <p className="duration">
                        <i className="ti ti-moon" aria-hidden="true" />
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>

                      <div className="price">
                        <span>₹{Number(totalPrice).toLocaleString("en-IN")}</span>
                        <span className="hint">incl. taxes &amp; fees</span>
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
            <h2>No trips booked ... yet!</h2>
            <p>
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Button
              variant="contained"
              className="trip-btn"
              onClick={handleStartSearching}
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