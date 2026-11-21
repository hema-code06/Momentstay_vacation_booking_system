import { store } from "../redux/store";
import { setLogout } from "../redux/state";

export const API_URL = process.env.REACT_APP_API_URL || "/api";

export const apiFetch = (path, options) => fetch(`${API_URL}${path}`, options);

export const authFetch = async (path, token, options = {}) => {
  const response = await apiFetch(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) store.dispatch(setLogout());
  return response;
};
