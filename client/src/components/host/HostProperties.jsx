import { Link } from "react-router-dom";
import { rupees } from "../../utils/helpers";
import { getImageUrl, handleImageError, getListingFallback } from "../../utils/imageHelper";

const HostProperties = ({ properties, onOpenReviews }) => {
  if (properties.length === 0) {
    return (
      <div className="host-empty">
        <h3>You have not listed a property yet</h3>
        <p>List your first property to start receiving bookings.</p>
        <Link to="/create-listing" className="host-button">
          Add your first property
        </Link>
      </div>
    );
  }

  return (
    <div className="host-properties">
      {properties.map((property, index) => (
        <article className="host-property" key={property._id}>
          <img
            src={getImageUrl(property.photo, getListingFallback(index))}
            alt={property.title}
            onError={(e) => handleImageError(e, getListingFallback(index))}
          />

          <div className="host-property__body">
            <span className="host-tag">{property.category}</span>
            <h3>{property.title}</h3>
            <p>
              {property.city}, {property.province}, {property.country}
            </p>
            <p className="host-property__price">{rupees(property.price)} per night</p>

            <div className="host-property__stats">
              <div>
                <strong>{property.bookingCount}</strong>
                <span>Bookings</span>
              </div>
              <div>
                <strong>{rupees(property.earnings)}</strong>
                <span>Earned</span>
              </div>
              <div>
                <strong>{property.reviewCount ? property.averageRating.toFixed(1) : "-"}</strong>
                <span>Rating</span>
              </div>
            </div>

            <div className="host-property__actions">
              <Link to={`/properties/${property._id}`}>View</Link>
              <Link to={`/update-listing/${property._id}`}>Update</Link>
              <button type="button" onClick={() => onOpenReviews(property._id)}>
                Reviews ({property.reviewCount})
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default HostProperties;
