import { useState, useRef, useEffect } from "react";
import { Search, Person, Menu, Close } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.scss";
import { setLogout } from "../redux/state";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const isHomePage = location.pathname === "/";

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownMenu(false);
    }
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setSearchOpen(false);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setErrorMessage("Please enter a location.");
      return;
    }
    setErrorMessage("");
    setSearchOpen(false);
    navigate(`/properties/search/${search}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setSearchOpen(false);
      setErrorMessage("");
    }
  };

  const profileSrc = user?.profileImagePath?.startsWith("http")
    ? user.profileImagePath
    : `${process.env.REACT_APP_API_URL}/${user?.profileImagePath?.replace("public", "")}`;

  return (
    <nav className={`navbar ${isHomePage ? "navbar--home" : "navbar--inner"}`}>
      <a href="/" className="navbar__logo">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      {isHomePage && (
        <div className="navbar__search-wrap" ref={searchRef}>
          {!searchOpen ? (
            <button
              className="navbar__search-pill"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search fontSize="small" />
              <span>Anywhere</span>
            </button>
          ) : (
            <div className="navbar__search-expanded">
              <Search className="navbar__search-icon" fontSize="small" />
              <input
                autoFocus
                type="text"
                placeholder="Bubble tent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="navbar__search-input"
              />
              {search && (
                <button
                  className="navbar__search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear"
                >
                  <Close fontSize="small" />
                </button>
              )}
              <button className="navbar__search-btn" onClick={handleSearch}>
                <Search fontSize="small" />
                <span>Search</span>
              </button>
              {errorMessage && (
                <span className="navbar__search-error">{errorMessage}</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="navbar__right">
        {isHomePage && (
          <Link to="/create-listing" className="navbar__host-link">
            List your property
          </Link>
        )}

        <div className="navbar__account-wrap" ref={dropdownRef}>
          <button
            className="navbar__account-btn"
            onClick={() => setDropdownMenu(!dropdownMenu)}
            aria-label="Account menu"
          >
            <Menu fontSize="small" />
            {!user ? (
              <Person fontSize="small" />
            ) : (
              <img src={profileSrc} alt="profile" className="navbar__avatar" />
            )}
          </button>

          {dropdownMenu && (
            <div className="navbar__dropdown">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setDropdownMenu(false)}>Login</Link>
                  <Link to="/register" onClick={() => setDropdownMenu(false)}>Register</Link>
                </>
              ) : (
                <>
                  <Link to={`/${user._id}/trips`} onClick={() => setDropdownMenu(false)}>Trips</Link>
                  <Link to={`/${user._id}/wishList`} onClick={() => setDropdownMenu(false)}>Wishlists</Link>
                  <Link to={`/${user._id}/properties`} onClick={() => setDropdownMenu(false)}>Property List</Link>
                  <Link to={`/${user._id}/reservations`} onClick={() => setDropdownMenu(false)}>Reservations</Link>
                  <Link to="/create-listing" onClick={() => setDropdownMenu(false)}>Post a Property</Link>
                  <div className="navbar__dropdown-divider" />
                  <Link
                    to="/login"
                    onClick={() => { dispatch(setLogout()); setDropdownMenu(false); }}
                    className="navbar__dropdown-logout"
                  >
                    Log Out
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;