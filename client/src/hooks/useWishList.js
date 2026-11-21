import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setWishList } from "../redux/state";
import { authFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";

const NO_ITEMS = [];

const useWishList = () => {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const wishList = useSelector((state) => state.user?.wishList ?? NO_ITEMS);

  const isSaved = useCallback(
    (listingId) => wishList.some((item) => item._id === listingId),
    [wishList]
  );

  const toggle = useCallback(
    async (listingId) => {
      if (!user || !token) {
        toast.info("Please login to use your wishlist.");
        navigate("/login", { state: { from: location.pathname } });
        return null;
      }

      try {
        const response = await authFetch(`/users/${user._id}/${listingId}`, token, {
          method: "PATCH",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        dispatch(setWishList(data.wishList));
        return !wishList.some((item) => item._id === listingId);
      } catch (err) {
        toast.error(err.message || "Failed to update wishlist.");
        return null;
      }
    },
    [user, token, wishList, dispatch, navigate, location.pathname, toast]
  );

  return { wishList, isSaved, toggle };
};

export default useWishList;
