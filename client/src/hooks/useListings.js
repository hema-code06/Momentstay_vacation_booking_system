import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

const useListings = (path) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    apiFetch(path)
      .then((response) => (response.ok ? response.json() : []))
      .catch(() => [])
      .then((data) => {
        if (ignore) return;
        setListings(Array.isArray(data) ? data : []);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [path]);

  return { listings, loading };
};

export default useListings;
