import { useState } from "react";
import { ArrowForwardIos, ArrowBackIosNew } from "@mui/icons-material";
import "../styles/UpdateListing.scss";

const UpdateListing = ({
  listingId,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  onEdit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + listingPhotoPaths.length) % listingPhotoPaths.length);

  const goToNextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % listingPhotoPaths.length);

  return (
    <div className="listing-card">
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {listingPhotoPaths?.map((photo, index) => (
            <div key={index} className="slide">
              <img
                src={photo?.startsWith("http") ? photo : `${process.env.REACT_APP_API_URL}/${photo?.replace("public", "")}`}
                alt={`${index + 1}`}
              />
              <div className="prev-button" onClick={goToPrevSlide}>
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div className="next-button" onClick={goToNextSlide}>
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info">
        <h3>{city}, {province}, {country}</h3>
        <p>{category}</p>
        <p>{type}</p>
        <p><span>₹{price}</span> per night</p>
      </div>

      <button
        className="update-btn"
        onClick={(e) => { e.stopPropagation(); onEdit(listingId); }}
      >
        Update
      </button>
    </div>
  );
};

export default UpdateListing;