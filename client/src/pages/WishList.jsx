import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

import { removeFromWishList } from "../redux/state";

import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import "../styles/WishList.scss";

const WishList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishList = useSelector((state) => state.user.wishList);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleRemove = (listingId) => {
    try {
      dispatch(removeFromWishList(listingId));

      setMessage("Property removed from wishlist");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to remove property");
      setMessageType("error");
    }
  };

  const handleStartExploring = () => {
    navigate("/");
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <Navbar />
      <div className="wish-list-container">
        <div className="wish-list-header">
          {wishList.length > 0 && (
            <div className="wishlist-count">
              {wishList.length} {wishList.length === 1 ? "Property" : "Properties"}
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${messageType}`}>{message}</div>
        )}

        {wishList.length === 0 ? (
          <div className="empty-wish-list">
            <div className="empty-icon">
              <FavoriteBorderIcon />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              Start exploring premium properties and save your favorites here.
            </p>

            <Button
              variant="contained"
              className="wish-btn"
              onClick={handleStartExploring}
            >
              Explore Properties
            </Button>
          </div>
        ) : (
          <div className="list">
            {wishList.map(
              ({
                _id,
                creator,
                listingPhotoPaths,
                city,
                province,
                country,
                category,
                type,
                price,
                booking = false,
              }, index) => (
                <div key={_id} className="listing-card-wrapper" style={{ "--i": index }}>
                  <ListingCard
                    listingId={_id}
                    creator={creator}
                    listingPhotoPaths={listingPhotoPaths}
                    city={city}
                    province={province}
                    country={country}
                    category={category}
                    type={type}
                    price={price}
                    booking={booking}
                  />

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(_id)}
                  >
                    <DeleteOutlineIcon />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default WishList;