import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import HostOverview from "../components/host/HostOverview";
import HostProperties from "../components/host/HostProperties";
import HostBookings from "../components/host/HostBookings";
import HostReviews from "../components/host/HostReviews";
import "../styles/HostDashboard.scss";
import { useToast } from "../context/ToastContext";
import { authFetch } from "../utils/api";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "properties", label: "Properties" },
    { id: "bookings", label: "Bookings" },
    { id: "reviews", label: "Reviews" },
];

const HostDashboard = () => {
    const token = useSelector((state) => state.token);
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewProperty, setReviewProperty] = useState("all");

    const requested = searchParams.get("tab");
    const tab = TABS.some((item) => item.id === requested) ? requested : "overview";

    const load = useCallback(async () => {
        try {
            const response = await authFetch("/host/dashboard", token);
            if (!response.ok) throw new Error("Request failed");
            setData(await response.json());
            setError("");
        } catch (err) {
            console.log("Loading host dashboard failed", err.message);
            setError("Could not load your host dashboard. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const changeTab = (id) => setSearchParams({ tab: id });

    const openReviews = (propertyId) => {
        setReviewProperty(propertyId);
        changeTab("reviews");
    };

    const runAction = async (path, options, successMessage, failMessage) => {
        try {
            const response = await authFetch(path, token, options);
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || failMessage);
            toast.success(successMessage);
            await load();
        } catch (err) {
            toast.error(err.message || failMessage);
        }
    };

    const collectPayment = (bookingId) =>
        runAction(
            `/bookings/${bookingId}/collect`,
            { method: "PATCH" },
            "Payment marked as received.",
            "Could not update the payment."
        );

    const cancelBooking = (bookingId) => {
        if (!window.confirm("Cancel this booking? The guest will lose this reservation.")) return;
        runAction(
            `/bookings/delete/${bookingId}`,
            { method: "DELETE" },
            "Booking cancelled.",
            "Could not cancel the booking."
        );
    };

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />

            <div className="host-dashboard">
                <div className="host-header">
                    <div>
                        <h1>Host dashboard</h1>
                        <p>Manage your properties, see who booked and how they paid, and read guest reviews.</p>
                    </div>
                    <Link to="/create-listing" className="host-button">
                        Add property
                    </Link>
                </div>

                {error || !data ? (
                    <div className="host-empty">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <nav className="host-tabs" aria-label="Host sections">
                            {TABS.map(({ id, label }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={tab === id ? "active" : ""}
                                    onClick={() => changeTab(id)}
                                >
                                    {label}
                                    {id === "bookings" && data.stats.upcomingBookings > 0 && (
                                        <span>{data.stats.upcomingBookings}</span>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {tab === "overview" && (
                            <HostOverview
                                stats={data.stats}
                                bookings={data.bookings}
                                reviews={data.reviews}
                                onTab={changeTab}
                            />
                        )}
                        {tab === "properties" && (
                            <HostProperties properties={data.properties} onOpenReviews={openReviews} />
                        )}
                        {tab === "bookings" && (
                            <HostBookings
                                bookings={data.bookings}
                                properties={data.properties}
                                onCollect={collectPayment}
                                onCancel={cancelBooking}
                            />
                        )}
                        {tab === "reviews" && (
                            <HostReviews
                                reviews={data.reviews}
                                properties={data.properties}
                                propertyId={reviewProperty}
                                onPropertyChange={setReviewProperty}
                            />
                        )}
                    </>
                )}
            </div>

            <Footer />
        </>
    );
};

export default HostDashboard;
