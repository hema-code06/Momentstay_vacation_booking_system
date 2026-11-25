import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./context/ToastContext";
import RequireAuth from "./components/RequireAuth";
import ScrollAnimations from "./components/reveal";
import ListingDetails from "./components/ListingDetails";
import ListingReview from "./components/ListingReview";
import Testimonials from "./components/Testimonials";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Category from "./pages/Category";
import Search from "./pages/Search";
import CreateListing from "./pages/CreateListing";
import UpdateProperty from "./pages/UpdateProperty";
import UpdateBooking from "./pages/UpdateBooking";
import TripList from "./pages/TripList";
import WishList from "./pages/WishList";
import ReservationList from "./pages/ReservationList";
import HostDashboard from "./pages/HostDashboard";
import Notifications from "./pages/Notifications";

const App = () => (
  <ToastProvider>
    <ScrollAnimations />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/properties/:listingId" element={<ListingDetails />} />
        <Route path="/properties/category/:category" element={<Category />} />
        <Route path="/properties/search/:search" element={<Search />} />
        <Route path="/feedback/:listingId" element={<ListingReview />} />
        <Route path="/testimonials/:id" element={<Testimonials />} />

        <Route element={<RequireAuth />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/update-listing/:listingId" element={<UpdateProperty />} />
          <Route path="/bookings/update/:bookingId" element={<UpdateBooking />} />
          <Route path="/:userId/trips" element={<TripList />} />
          <Route path="/:userId/wishList" element={<WishList />} />
          <Route path="/:userId/reservations" element={<ReservationList />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ToastProvider>
);

export default App;
