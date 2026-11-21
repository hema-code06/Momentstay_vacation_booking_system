const DAY_MS = 24 * 60 * 60 * 1000;

export const nightsBetween = (start, end) =>
  Math.max(1, Math.round((new Date(end) - new Date(start)) / DAY_MS));

export const normalizeAmenities = (raw) => [
  ...new Set(
    [].concat(raw || [])
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean)
  ),
];

export const toCount = (value) => Math.max(parseInt(value, 10) || 1, 1);
