import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowForwardIos, ArrowBackIosNew, Favorite } from "@mui/icons-material";
import "../styles/ListingCard.scss";
import useWishList from "../hooks/useWishList";
import { getImageUrl, handleImageError, getListingFallback } from "../utils/imageHelper";

const ListingCard = ({ listing }) => {
  const { _id, creator, listingPhotoPaths = [], city, province, country, category, type, price } = listing;
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?._id);
  const { isSaved, toggle } = useWishList();

  const totalPhotos = listingPhotoPaths.length;
  const isOwner = Boolean(userId) && creator?._id === userId;

  const slide = (step) => (e) => {
    e.stopPropagation();
    if (totalPhotos > 1) setCurrentIndex((index) => (index + step + totalPhotos) % totalPhotos);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!isOwner) toggle(_id);
  };

  return (
    <div className="listing-card" onClick={() => navigate(`/properties/${_id}`)}>
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {listingPhotoPaths.map((photo, index) => (
            <div key={index} className="slide">
              <img
                src={getImageUrl(photo, getListingFallback(index))}
                alt={`${city} ${index + 1}`}
                onError={(e) => handleImageError(e, getListingFallback(index))}
              />
              <div className="prev-button" onClick={slide(-1)}>
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div className="next-button" onClick={slide(1)}>
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info">
        <h3>
          {city}, {province}, {country}
        </h3>
        <p>{category}</p>
        <p>{type}</p>
        <p>
          <span>₹{price}</span> per night
        </p>
      </div>

      <button className="favorite" onClick={handleFavorite} aria-label="Toggle wishlist">
        <Favorite sx={{ color: isSaved(_id) ? "red" : "white" }} />
      </button>
    </div>
  );
};

export default ListingCard;
