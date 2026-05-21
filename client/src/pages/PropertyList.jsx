import "../styles/PropertyList.scss";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import UpdateListing from "../components/UpdateListing";
import { setPropertyList } from "../redux/state";
import Loader from "../components/Loader";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";


const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state) => state.user._id);
  const propertyList = useSelector((state) => state.user.propertyList);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getPropertyList = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}/properties`,
        {
          method: "GET",
        },
      );
      const data = await response.json();
      dispatch(setPropertyList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetching Properties failed", err.message);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    getPropertyList();
  }, [getPropertyList]);

  const handleStartCreating = () => {
    navigate("/create-listing");
  };

  const handleEditProperty = (listingId) => {
    navigate(`/update-listing/${listingId}`);
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="property-container">
        <div className="property-list-header">
          {propertyList.length > 0 && (
            <div className="propertylist-count">
              <HomeWorkOutlinedIcon
                style={{ color: "#004369", marginRight: "6px", fontSize: "20px" }}
              />
              {propertyList.length} {propertyList.length === 1 ? "Property" : "Properties"}
            </div>
          )}
        </div>
        {propertyList && propertyList.length > 0 ? (
          <>
            <div className="list">
              {propertyList.map(
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
                }) => (
                  <div key={_id} className="property-item">
                    <UpdateListing
                      listingId={_id}
                      creator={creator}
                      listingPhotoPaths={listingPhotoPaths}
                      city={city}
                      province={province}
                      country={country}
                      category={category}
                      type={type}
                      price={price}
                      onEdit={handleEditProperty}
                    />
                  </div>
                ),
              )}
            </div>
          </>
        ) : (
          <div className="empty-property-list">
            <div className="empty-icon">
              <HomeWorkOutlinedIcon />
            </div>
            <h2>No properties listed ... yet!</h2>
            <p>Time to showcase your beautiful properties to the world.</p>
            <Button
              variant="contained"
              className="property-btn"
              onClick={handleStartCreating}
            >
              Add Property
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyList;
