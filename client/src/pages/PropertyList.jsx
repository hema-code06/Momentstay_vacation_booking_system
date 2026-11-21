import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import Navbar from "../components/Navbar";
import UpdateListing from "../components/UpdateListing";
import Loader from "../components/Loader";
import "../styles/PropertyList.scss";
import { authFetch } from "../utils/api";

const PropertyList = () => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?._id);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    let ignore = false;

    authFetch(`/users/${userId}/properties`, token)
      .then((response) => (response.ok ? response.json() : []))
      .catch((err) => {
        console.log("Fetching properties failed", err.message);
        return [];
      })
      .then((data) => {
        if (ignore) return;
        setProperties(data);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId, token]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="property-container">
        <div className="property-list-header">
          {properties.length > 0 && (
            <div className="propertylist-count">
              <HomeWorkOutlinedIcon
                style={{ color: "#004369", marginRight: "6px", fontSize: "20px" }}
              />
              {properties.length} {properties.length === 1 ? "Property" : "Properties"}
            </div>
          )}
        </div>
        {properties.length > 0 ? (
          <div className="list">
            {properties.map((property) => (
              <div key={property._id} className="property-item">
                <UpdateListing
                  listingId={property._id}
                  listingPhotoPaths={property.listingPhotoPaths}
                  city={property.city}
                  province={property.province}
                  country={property.country}
                  category={property.category}
                  price={property.price}
                  onEdit={(id) => navigate(`/update-listing/${id}`)}
                />
              </div>
            ))}
          </div>
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
              onClick={() => navigate("/create-listing")}
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
