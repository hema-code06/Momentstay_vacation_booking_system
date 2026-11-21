import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import useListings from "../hooks/useListings";

const Category = () => {
  const { category } = useParams();
  const { listings, loading } = useListings(`/properties?category=${encodeURIComponent(category)}`);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="list" style={{ minHeight: "100vh" }}>
        {listings.length === 0 ? (
          <h2 className="no-listings">No properties found in this category.</h2>
        ) : (
          listings.map((listing) => (
            <div key={listing._id} className="listing-card-wrapper">
              <ListingCard listing={listing} />
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default Category;
