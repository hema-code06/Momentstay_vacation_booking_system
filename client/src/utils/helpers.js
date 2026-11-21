export const nightsBetween = (start, end) =>
  Math.max(1, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));

// Handles old comma-joined amenity strings and de-duplicates
export const normalizeAmenities = (raw) => [
  ...new Set(
    [].concat(raw || [])
      .flatMap((a) => String(a).split(","))
      .map((s) => s.trim())
      .filter(Boolean)
  ),
];