import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const RequireAuth = () => {
    const loggedIn = useSelector((state) => Boolean(state.user && state.token));
    const location = useLocation();

    return loggedIn ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
};

export default RequireAuth;
