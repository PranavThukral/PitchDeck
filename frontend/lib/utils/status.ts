export const STATUS_ORDER = {
  upcoming: 1,
  open: 2,
  "closing-soon": 2,
  closed: 3,
} as const;

export const normalizeStatus = (rawStatus: string | undefined): string => {
  const cleaned = (rawStatus || "")
    .replace(/\[|\]|"|'/g, "")
    .trim()
    .toLowerCase();

  if (["open", "closed", "upcoming", "closing-soon"].includes(cleaned))
    return cleaned;
  if (cleaned.includes("close")) return "closed";
  if (cleaned.includes("open")) return "open";
  if (cleaned.includes("upcoming")) return "upcoming";
  if (cleaned.includes("closing")) return "closing-soon";
  return "open";
};
