import { useCallback, useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import useListings from "../hooks/useListings";

const SCROLL_STEP = 200;

const Listings = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const categoryListRef = useRef(null);

  const path =
    selectedCategory === "All"
      ? "/properties"
      : `/properties?category=${encodeURIComponent(selectedCategory)}`;
  const { listings, loading } = useListings(path);

  const updateScrollButtons = useCallback(() => {
    const list = categoryListRef.current;
    if (!list) return;
    setCanScrollLeft(list.scrollLeft > 0);
    setCanScrollRight(list.scrollWidth > list.clientWidth + list.scrollLeft);
  }, []);

  useEffect(() => {
    updateScrollButtons();
  }, [updateScrollButtons]);

  const scrollCategories = (direction) => {
    const list = categoryListRef.current;
    if (!list) return;
    list.scrollTo({ left: list.scrollLeft + direction * SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <>
      <div className="category-list-container">
        {canScrollLeft && (
          <div className="scroll-icon left" onClick={() => scrollCategories(-1)}>
            <IoIosArrowBack />
          </div>
        )}
        <div className="category-list" ref={categoryListRef} onScroll={updateScrollButtons}>
          {categories.map(({ label, icon }) => (
            <div
              className={`category ${label === selectedCategory ? "selected" : ""}`}
              key={label}
              onClick={() => setSelectedCategory(label)}
            >
              <div className="category_icon">{icon}</div>
              <p>{label}</p>
            </div>
          ))}
        </div>
        {canScrollRight && (
          <div className="scroll-icon right" onClick={() => scrollCategories(1)}>
            <IoIosArrowForward />
          </div>
        )}
      </div>

      {loading ? (
        <div className="listings-loader">
          <Loader />
        </div>
      ) : listings.length === 0 ? (
        <div className="listings-empty">
          <span className="listings-empty__icon">🏡</span>
          <p>No properties found in this category.</p>
        </div>
      ) : (
        <div className="listings">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
};

export default Listings;
