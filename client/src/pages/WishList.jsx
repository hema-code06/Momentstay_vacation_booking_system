import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { FaHeart } from "react-icons/fa";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import useWishList from "../hooks/useWishList";
import "../styles/WishList.scss";

const WishList = () => {
  const navigate = useNavigate();
  const { wishList, toggle } = useWishList();

  return (
    <>
      <Navbar />
      <div className="wish-list-container">
        <div className="wish-list-header">
          {wishList.length > 0 && (
            <div className="wishlist-count">
              <FaHeart style={{ color: "red", marginRight: "6px" }} />
              {wishList.length} {wishList.length === 1 ? "Favorite" : "Favorites"}
            </div>
          )}
        </div>

        {wishList.length === 0 ? (
          <div className="empty-wish-list">
            <div className="empty-icon">
              <FavoriteBorderIcon />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Start exploring premium properties and save your favorites here.</p>
            <Button variant="contained" className="wish-btn" onClick={() => navigate("/")}>
              Explore Properties
            </Button>
          </div>
        ) : (
          <div className="list">
            {wishList.map((listing, index) => (
              <div key={listing._id} className="listing-card-wrapper" style={{ "--i": index }}>
                <ListingCard listing={listing} />
                <button
                  className="remove-btn"
                  onClick={() => toggle(listing._id)}
                  aria-label="Remove from wishlist"
                >
                  <DeleteOutlineIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishList;
