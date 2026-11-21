import { API_URL } from "./api";

export const AVATAR_FALLBACK = "/assets/person.png";
export const HOST_FALLBACK = "/assets/host.png";
const DEFAULT_FALLBACK = "/assets/Home.jpg";
const FALLBACK_COUNT = 35;

export const getImageUrl = (path, fallback = DEFAULT_FALLBACK) => {
  if (!path || typeof path !== "string") return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/assets/")) return path;
  return `${API_URL}/${path.replace(/^\/?(public\/)?/, "")}`;
};

export const handleImageError = (e, fallback = DEFAULT_FALLBACK) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};

export const getListingFallback = (index = 0) =>
  `/assets/i${(Math.abs(Number(index) || 0) % FALLBACK_COUNT) + 1}.jpg`;
