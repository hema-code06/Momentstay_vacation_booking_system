import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import "../styles/Notifications.scss";
import { useToast } from "../context/ToastContext";
import { NOTIFICATIONS_CHANGED } from "../hooks/useNotifications";
import { authFetch } from "../utils/api";
import { timeAgo } from "../utils/helpers";

const TYPES = {
    booking_cancelled_by_host: { Icon: CancelOutlinedIcon, tone: "danger" },
    booking_cancelled_by_guest: { Icon: CancelOutlinedIcon, tone: "danger" },
    payment_received: { Icon: PaymentsOutlinedIcon, tone: "success" },
    booking_created: { Icon: EventAvailableOutlinedIcon, tone: "info" },
    booking_rescheduled: { Icon: EventAvailableOutlinedIcon, tone: "info" },
    review_received: { Icon: StarBorderOutlinedIcon, tone: "info" },
};

const announceChange = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));

const Notifications = () => {
    const token = useSelector((state) => state.token);
    const navigate = useNavigate();
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const response = await authFetch("/notifications", token);
            if (!response.ok) throw new Error("Request failed");
            const data = await response.json();
            setItems(data.notifications);

            if (data.unreadCount > 0) {
                await authFetch("/notifications/read-all", token, { method: "PATCH" });
                announceChange();
            }
        } catch (err) {
            console.log("Loading notifications failed", err.message);
            toast.error("Could not load your notifications.");
        } finally {
            setLoading(false);
        }
    }, [token, toast]);

    useEffect(() => {
        load();
    }, [load]);

    const remove = async (id) => {
        const response = await authFetch(`/notifications/${id}`, token, { method: "DELETE" }).catch(() => null);
        if (response?.ok) setItems((prev) => prev.filter((item) => item._id !== id));
        else toast.error("Could not delete the notification.");
    };

    const clearAll = async () => {
        const response = await authFetch("/notifications", token, { method: "DELETE" }).catch(() => null);
        if (response?.ok) {
            setItems([]);
            announceChange();
        } else {
            toast.error("Could not clear your notifications.");
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />

            <div className="notifications-page">
                <div className="notifications-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>Updates about your bookings, payments and reviews.</p>
                    </div>
                    {items.length > 0 && (
                        <button type="button" className="notifications-clear" onClick={clearAll}>
                            Clear all
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="notifications-empty">
                        <NotificationsNoneOutlinedIcon />
                        <h3>You are all caught up</h3>
                        <p>When a host or guest updates a booking, you will see it here.</p>
                    </div>
                ) : (
                    <ul className="notifications-list">
                        {items.map((item) => {
                            const { Icon, tone } = TYPES[item.type] || TYPES.booking_created;
                            return (
                                <li key={item._id} className={`notification ${item.read ? "" : "unread"}`}>
                                    <span className={`notification__icon notification__icon--${tone}`}>
                                        <Icon />
                                    </span>

                                    <div className="notification__body">
                                        <div className="notification__top">
                                            <h3>{item.title}</h3>
                                            {!item.read && <em>New</em>}
                                        </div>
                                        <p>{item.message}</p>
                                        <div className="notification__bottom">
                                            <span>{timeAgo(item.createdAt)}</span>
                                            {item.link && item.actionLabel && (
                                                <button type="button" onClick={() => navigate(item.link)}>
                                                    {item.actionLabel}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="notification__close"
                                        onClick={() => remove(item._id)}
                                        aria-label="Delete notification"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
};

export default Notifications;
