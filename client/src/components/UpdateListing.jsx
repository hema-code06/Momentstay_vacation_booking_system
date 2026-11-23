import { useState } from "react";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  EditOutlined,
  LocationOnOutlined,
  HomeWorkOutlined,
  LocalOfferOutlined,
} from "@mui/icons-material";

import "../styles/UpdateListing.scss";
import { getImageUrl, handleImageError, getListingFallback } from "../utils/imageHelper";

const UpdateListing = ({
  listingId,
  listingPhotoPaths = [],
  city,
  province,
  country,
  category,
  price,
  onEdit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = listingPhotoPaths.length;

  const goToPrevSlide = (e) => {
    e.stopPropagation();
    if (totalSlides <= 1) return;
    setCurrentIndex(
      (prev) => (prev - 1 + totalSlides) % totalSlides
    );
  };

  const goToNextSlide = (e) => {
    e.stopPropagation();
    if (totalSlides <= 1) return;
    setCurrentIndex(
      (prev) => (prev + 1) % totalSlides
    );
  };

  return (
    <div className="update-listing-card" onClick={() => onEdit(listingId)}
      style={{ cursor: "pointer" }}>
      <div className="image-wrapper">
        <div
          className="slider"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {listingPhotoPaths.map((photo, index) => (
            <div className="slide" key={index}>
              <img
                src={getImageUrl(photo, getListingFallback(index))}
                alt={`listing-${index}`}
                onError={(e) => handleImageError(e, getListingFallback(index))}
              />
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <>
            <button
              className="nav-btn prev-btn"
              onClick={goToPrevSlide}
            >
              <ArrowBackIosNew sx={{ fontSize: "14px" }} />
            </button>

            <button
              className="nav-btn next-btn"
              onClick={goToNextSlide}
            >
              <ArrowForwardIos sx={{ fontSize: "14px" }} />
            </button>

            <div className="slider-dots">
              {listingPhotoPaths.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${currentIndex === index ? "active" : ""
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="listing-content">
        <div className="listing-top">
          <div className="listing-tags">
            <span className="tag category-tag">
              <HomeWorkOutlined sx={{ fontSize: "15px" }} />
              {category}
            </span>
          </div>
          <h2>
            <LocationOnOutlined sx={{ fontSize: "18px" }} />
            {city}, {province}, {country}
          </h2>

          <div className="listing-price">
            <LocalOfferOutlined sx={{ fontSize: "18px" }} />

            <div className="price-text">
              <span>{price}</span>
              <small>/night</small>
            </div>
          </div>
        </div>

        <button
          className="update-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(listingId);
          }}
        >
          <EditOutlined sx={{ fontSize: "18px" }} />
          Update Properties
        </button>
      </div>
    </div>
  );
};

export default UpdateListing;