import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { authFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";

const POLL_INTERVAL = 60000;

export const NOTIFICATIONS_CHANGED = "momentstay:notifications-changed";

const useNotifications = () => {
    const token = useSelector((state) => state.token);
    const toast = useToast();
    const [unreadCount, setUnreadCount] = useState(0);
    const previous = useRef(null);

    const refresh = useCallback(async () => {
        if (!token) return;

        const response = await authFetch("/notifications/unread-count", token).catch(() => null);
        if (!response || !response.ok) return;

        const { unreadCount: count } = await response.json();
        if (previous.current !== null && count > previous.current) {
            toast.info("You have a new notification.");
        }
        previous.current = count;
        setUnreadCount(count);
    }, [token, toast]);

    useEffect(() => {
        if (!token) {
            previous.current = null;
            setUnreadCount(0);
            return undefined;
        }

        refresh();
        const timer = setInterval(refresh, POLL_INTERVAL);
        window.addEventListener("focus", refresh);
        window.addEventListener(NOTIFICATIONS_CHANGED, refresh);

        return () => {
            clearInterval(timer);
            window.removeEventListener("focus", refresh);
            window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
        };
    }, [token, refresh]);

    return { unreadCount };
};

export default useNotifications;
