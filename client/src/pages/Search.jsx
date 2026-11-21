import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";
import useListings from "../hooks/useListings";
import "../styles/Search.scss";

const Search = () => {
  const { search } = useParams();
  const navigate = useNavigate();
  const { listings, loading } = useListings(`/properties/search/${encodeURIComponent(search)}`);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      {listings.length > 0 && <h1 className="title-list">{search}</h1>}
      <div className="list">
        {listings.length > 0 ? (
          listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)
        ) : (
          <div className="no-results">
            <h2>
              No search results found for{" "}
              <span style={{ color: "#004369" }}>"{search}"</span>
            </h2>
            <Button variant="contained" className="btn-go-back" onClick={() => navigate("/")}>
              Go Back to Home
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Search;
