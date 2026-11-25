import { useState, useRef, useEffect } from "react";
import { Search, Person, Menu, Close, NotificationsNoneOutlined } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.scss";
import { setLogout } from "../redux/state";
import { useToast } from "../context/ToastContext";
import useNotifications from "../hooks/useNotifications";
import { getImageUrl, handleImageError, AVATAR_FALLBACK } from "../utils/imageHelper";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useToast();

  const user = useSelector((state) => state.user);
  const { unreadCount } = useNotifications();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setErrorMessage("");
      }
    };

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
    navigate(`/properties/search/${encodeURIComponent(search.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setSearchOpen(false);
      setErrorMessage("");
    }
  };

  const handleLogout = () => {
    setDropdownMenu(false);
    dispatch(setLogout());
    navigate("/");
  };

  const profileSrc = getImageUrl(user?.profileImagePath, AVATAR_FALLBACK);

  return (
    <nav className={`navbar ${isHomePage ? "navbar--home" : "navbar--inner"}`}>
      <Link to="/" className="navbar__logo">
        <img src="/assets/logo.png" alt="logo" />
      </Link>

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
          <Link
            to="/host"
            className="navbar__host-link"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                toast.info("Please login or register to manage your properties.");
                navigate("/login", { state: { from: "/host" } });
              }
            }}
          >
            Become a host
          </Link>
        )}

        {user && (
          <Link
            to="/notifications"
            className="navbar__bell"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          >
            <NotificationsNoneOutlined fontSize="small" />
            {unreadCount > 0 && (
              <span className="navbar__bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
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
              <img
                src={profileSrc}
                alt="profile"
                className="navbar__avatar"
                onError={(e) => handleImageError(e, AVATAR_FALLBACK)}
              />
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
                  <Link to={`/${user._id}/trips`} onClick={() => setDropdownMenu(false)}>Trip Journal</Link>
                  <Link to={`/${user._id}/wishList`} onClick={() => setDropdownMenu(false)}>Wishlists</Link>
                  <Link to={`/${user._id}/reservations`} onClick={() => setDropdownMenu(false)}>Reservation List</Link>
                  <Link to="/notifications" onClick={() => setDropdownMenu(false)}>
                    Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
                  </Link>
                  <Link to="/host" onClick={() => setDropdownMenu(false)}>Host dashboard</Link>
                  <div className="navbar__dropdown-divider" />
                  <button type="button" className="navbar__dropdown-logout" onClick={handleLogout}>
                    Log Out
                  </button>
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