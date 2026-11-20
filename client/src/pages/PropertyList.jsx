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
import { authFetch } from "../utils/api";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state?.user);
  const userId = user?._id;
  const token = useSelector((state) => state?.token);
  const propertyList = user?.propertyList || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  const getPropertyList = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const response = await authFetch(
        `${process.env.REACT_APP_API_URL}/users/${userId}/properties`,
        token,
        { method: "GET" },
      );
      if (response.ok) {
        const data = await response.json();
        dispatch(setPropertyList(data));
      }
    } catch (err) {
      console.log("Fetching Properties failed", err.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch, userId, token]);

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
                  listingPhotoPaths,
                  city,
                  province,
                  country,
                  category,
                  price,
                }) => (
                  <div key={_id} className="property-item">
                    <UpdateListing
                      listingId={_id}
                      listingPhotoPaths={listingPhotoPaths}
                      city={city}
                      province={province}
                      country={country}
                      category={category}
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
