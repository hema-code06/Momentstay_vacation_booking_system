export const getImageUrl = (path, fallback = "/assets/Home.jpg") => {
  if (!path || typeof path !== "string") return fallback;
  if (path.startsWith("/assets") || path.startsWith("assets")) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.replace(/^(\/)?public\//, "").replace(/^\//, "");
  const apiUrl = process.env.REACT_APP_API_URL || "/api";
  return `${apiUrl}/${cleanPath}`;
};

export const handleImageError = (e, fallback = "/assets/Home.jpg") => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};

export const getListingFallback = (index = 0) => {
  const safeIndex = (Math.abs(Number(index) || 0) % 35) + 1;
  return `/assets/i${safeIndex}.jpg`;
};

export const AVATAR_FALLBACK = "/assets/person.png";
export const HOST_FALLBACK = "/assets/host.png";
export const PROPERTY_FALLBACK = "/assets/Home.jpg";
