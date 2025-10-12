export type OpportunityType =
  | "Entrepreneurship"
  | "Internship"
  | "Leadership"
  | "Mentorship & Learning";

export const OPPORTUNITY_TYPE_ORDER: OpportunityType[] = [
  "Entrepreneurship",
  "Internship",
  "Leadership",
  "Mentorship & Learning",
];

export const OPPORTUNITY_TYPE_OPTIONS = OPPORTUNITY_TYPE_ORDER.map((value) => ({
  value,
  label: value,
}));

const keywordMap: Array<{ type: OpportunityType; keywords: string[] }> = [
  { type: "Entrepreneurship", keywords: ["entrepreneur", "venture", "startup", "business plan"] },
  { type: "Internship", keywords: ["intern", "co-op", "placement", "apprentice"] },
  { type: "Leadership", keywords: ["leader", "leadership", "executive", "captain"] },
  {
    type: "Mentorship & Learning",
    keywords: [
      "academy",
      "course",
      "bootcamp",
      "learning",
      "training",
      "workshop",
      "summer program",
      "fellowship",
      "scholarship",
      "career",
      "professional development",
      "mentor",
      "mentorship",
      "shadowing",
    ],
  },
];

const titleOverrides: Record<string, OpportunityType> = {
  "summer company program for young entrepreneurs": "Entrepreneurship",
  "ja company program": "Entrepreneurship",
  "ja career accelerator": "Internship",
  "sunlife dbts": "Internship",
  "the mina project": "Internship",
  "ivey slp": "Mentorship & Learning",
  "schulich sbea": "Mentorship & Learning",
  "icon fellowship": "Mentorship & Learning",
  "icon talent - scholars": "Mentorship & Learning",
  "icon talent - scholars,": "Mentorship & Learning",
  "qlead": "Mentorship & Learning",
  "fblc nac/ntc": "Leadership",
  "ta stc regional executive": "Leadership",
};

export function matchOpportunityType(rawValue: string | undefined | null): OpportunityType | undefined {
  if (!rawValue) return undefined;
  const normalized = rawValue.toLowerCase();

  if (normalized === "career development") return "Mentorship & Learning";
  if (normalized === "mentorship & learning") return "Mentorship & Learning";

  if (normalized.includes("entrepren")) return "Entrepreneurship";
  if (normalized.includes("intern")) return "Internship";
  if (normalized.includes("leader")) return "Leadership";
  if (normalized.includes("mentorship") || normalized.includes("mentor")) return "Mentorship & Learning";
  if (normalized.includes("fellow")) return "Mentorship & Learning";
  if (normalized.includes("scholar")) return "Mentorship & Learning";
  if (normalized.includes("academy") || normalized.includes("course") || normalized.includes("program")) return "Mentorship & Learning";
  if (normalized.includes("career") || normalized.includes("professional")) return "Mentorship & Learning";

  const keywordHit = keywordMap.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return keywordHit?.type;
}

export function deriveOpportunityType({
  opportunityType,
  category,
  title,
  description,
}: {
  opportunityType?: string[] | string;
  category?: string;
  title?: string;
  description?: string;
}): OpportunityType {
  const normalizedTitle = title?.toLowerCase().trim();
  if (normalizedTitle && titleOverrides[normalizedTitle]) {
    return titleOverrides[normalizedTitle];
  }

  const valueList = Array.isArray(opportunityType)
    ? opportunityType
    : opportunityType
      ? [opportunityType]
      : [];

  for (const value of valueList) {
    const matched = matchOpportunityType(value);
    if (matched) return matched;
  }

  const byCategory = matchOpportunityType(category);
  if (byCategory) return byCategory;

  const fromTitle = matchOpportunityType(title);
  if (fromTitle) return fromTitle;

  const fromDescription = matchOpportunityType(description);
  if (fromDescription) return fromDescription;

  return "Mentorship & Learning";
}
