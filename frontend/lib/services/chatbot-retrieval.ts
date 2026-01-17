import type { BusinessOpportunity, Competition } from "@/lib/services/google-sheets";
import {
  fetchBusinessOpportunitiesFromSheets,
  fetchCompetitionsFromSheets,
  fetchEngineeringCompetitionsFromSheets,
  fetchEngineeringOpportunitiesFromSheets,
  fetchMedicineCompetitionsFromSheets,
  fetchMedicineOpportunitiesFromSheets,
} from "@/lib/services/google-sheets";

export type ChatDomain = "business" | "medicine" | "engineering";
export type ChatKind = "opportunity" | "competition";

export type ChatCatalogItem = {
  id: string;
  title: string;
  description: string;
  domain: ChatDomain;
  kind: ChatKind;
  status?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  format?: string;
  gradeTags?: string[];
  opportunityType?: string[];
  category?: string;
  teamRequirement?: string;
  subjectArea?: string[];
  cost?: string;
  costNumeric?: number;
  organizer?: string;
  applyUrl?: string;
  url: string;
  search: {
    title: string;
    description: string;
    organizer: string;
    location: string;
    tags: string;
    type: string;
    domain: string;
    kind: string;
  };
};

type ChatCache = {
  items: ChatCatalogItem[];
  updatedAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let catalogCache: ChatCache | null = null;

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "about",
  "into",
  "over",
  "after",
  "before",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "im",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "their",
  "them",
  "can",
  "could",
  "should",
  "would",
  "what",
  "where",
  "when",
  "which",
  "who",
  "why",
  "how",
  "find",
  "show",
  "list",
  "tell",
  "need",
  "looking",
  "looking",
  "get",
  "give",
  "want",
  "please",
  "help",
]);

const DOMAIN_HINTS: Record<ChatDomain, string[]> = {
  business: [
    "business",
    "entrepreneur",
    "entrepreneurship",
    "finance",
    "marketing",
    "startup",
    "pitch",
  ],
  medicine: [
    "medicine",
    "medical",
    "health",
    "healthcare",
    "clinical",
    "bio",
    "biology",
  ],
  engineering: [
    "engineering",
    "engineer",
    "stem",
    "robotics",
    "software",
    "computer",
    "coding",
    "electronics",
  ],
};

const KIND_HINTS: Record<ChatKind, string[]> = {
  opportunity: [
    "opportunity",
    "opportunities",
    "program",
    "programs",
    "internship",
    "internships",
    "placement",
    "placements",
    "mentorship",
    "leadership",
    "fellowship",
  ],
  competition: [
    "competition",
    "competitions",
    "contest",
    "challenge",
    "olympiad",
    "case",
    "pitch",
    "hackathon",
  ],
};

const STATUS_WEIGHT: Record<string, number> = {
  "closing-soon": 3,
  open: 2,
  upcoming: 1,
  closed: 0,
};

const normalizeText = (value: string | undefined): string =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const detectHint = (
  value: string,
  hints: Record<string, string[]>,
): string | null => {
  const normalized = normalizeText(value);
  for (const [key, terms] of Object.entries(hints)) {
    if (terms.some((term) => normalized.includes(term))) {
      return key;
    }
  }
  return null;
};

function buildCatalogItems(
  items: Competition[],
  domain: ChatDomain,
  kind: "competition",
): ChatCatalogItem[];
function buildCatalogItems(
  items: BusinessOpportunity[],
  domain: ChatDomain,
  kind: "opportunity",
): ChatCatalogItem[];
function buildCatalogItems(
  items: (Competition | BusinessOpportunity)[],
  domain: ChatDomain,
  kind: ChatKind,
): ChatCatalogItem[] {
  return items.map((item) => {
    const isCompetition = kind === "competition";
    const description =
      item.description ||
      `${item.title} ${isCompetition ? "competition" : "opportunity"}.`;
    const url =
      kind === "competition"
        ? `/${domain}-opportunities#${domain}-competitions`
        : `/${domain}-opportunities#${domain}-opportunities`;

    let tags: string[] = [];
    let typeLabel = "competition";
    let location = "";
    let deadline: string | undefined;
    let startDate: string | undefined;
    let endDate: string | undefined;
    let gradeTags: string[] = [];
    let opportunityType: string[] | undefined;
    let category: string | undefined;
    let teamRequirement: string | undefined;
    let subjectArea: string[] | undefined;
    let format: string | undefined;
    let cost: string | undefined;
    let costNumeric: number | undefined;

    if (isCompetition) {
      const competition = item as Competition;
      gradeTags = competition.gradeTags || [];
      teamRequirement = competition.teamRequirement || "";
      subjectArea = competition.subjectArea || [];
      location = competition.location || "";
      deadline = competition.deadline;
      cost = competition.cost;
      costNumeric = competition.costNumeric;
      tags = [
        ...gradeTags,
        teamRequirement,
        ...subjectArea,
        cost || "",
        location,
      ];
    } else {
      const opportunity = item as BusinessOpportunity;
      gradeTags = opportunity.gradeTags || [];
      opportunityType = opportunity.opportunityType || [];
      category = opportunity.category || "";
      format = opportunity.format || "";
      startDate = opportunity.startDate;
      endDate = opportunity.endDate;
      cost = opportunity.cost;
      costNumeric = opportunity.costNumeric;
      tags = [...gradeTags, ...opportunityType, category, format, cost || ""];
      typeLabel = `${category} ${opportunityType.join(" ")}`.trim();
    }

    return {
      id: item.id,
      title: item.title,
      description,
      domain,
      kind,
      status: item.status,
      deadline,
      startDate,
      endDate,
      location: location || undefined,
      format: format || undefined,
      gradeTags,
      opportunityType,
      category,
      teamRequirement,
      subjectArea,
      cost,
      costNumeric,
      organizer: item.organizer,
      applyUrl: item.applyUrl,
      url,
      search: {
        title: normalizeText(item.title),
        description: normalizeText(description),
        organizer: normalizeText(item.organizer || ""),
        location: normalizeText(location),
        tags: normalizeText(tags.filter(Boolean).join(" ")),
        type: normalizeText(typeLabel),
        domain: normalizeText(domain),
        kind: normalizeText(kind),
      },
    };
  });
}

const loadCatalog = async (): Promise<ChatCatalogItem[]> => {
  const now = Date.now();
  if (catalogCache && now - catalogCache.updatedAt < CACHE_TTL_MS) {
    return catalogCache.items;
  }

  const [
    businessCompetitions,
    businessOpportunities,
    medicineCompetitions,
    medicineOpportunities,
    engineeringCompetitions,
    engineeringOpportunities,
  ] = await Promise.all([
    fetchCompetitionsFromSheets(),
    fetchBusinessOpportunitiesFromSheets(),
    fetchMedicineCompetitionsFromSheets(),
    fetchMedicineOpportunitiesFromSheets(),
    fetchEngineeringCompetitionsFromSheets(),
    fetchEngineeringOpportunitiesFromSheets(),
  ]);

  const items: ChatCatalogItem[] = [
    ...buildCatalogItems(businessOpportunities, "business", "opportunity"),
    ...buildCatalogItems(businessCompetitions, "business", "competition"),
    ...buildCatalogItems(medicineOpportunities, "medicine", "opportunity"),
    ...buildCatalogItems(medicineCompetitions, "medicine", "competition"),
    ...buildCatalogItems(engineeringOpportunities, "engineering", "opportunity"),
    ...buildCatalogItems(engineeringCompetitions, "engineering", "competition"),
  ];

  catalogCache = { items, updatedAt: now };
  return items;
};

export const getChatCatalog = async (): Promise<ChatCatalogItem[]> =>
  loadCatalog();

const formatSummaryLine = (item: ChatCatalogItem): string => {
  const descriptor = `${item.domain} ${item.kind}`;
  const description = item.description
    ? item.description.slice(0, 160)
    : "No description available.";
  const details: string[] = [];

  if (item.deadline) details.push(`Deadline: ${item.deadline}`);
  if (item.endDate && !item.deadline)
    details.push(`Ends: ${item.endDate}`);
  if (item.location) details.push(`Location: ${item.location}`);
  if (item.status) details.push(`Status: ${item.status}`);

  const detailText = details.length > 0 ? ` | ${details.join(" | ")}` : "";
  return `- ${item.title} (${descriptor})${detailText}. ${description} Link: ${item.url}`;
};

const buildSiteMap = (): string =>
  [
    "Navigation: Business (/business-opportunities), Medicine (/medicine-opportunities), Engineering (/engineering-opportunities), Our Story (/our-story), Find Your Opportunity quiz (/findyouropp).",
    "Each category page has two sections: opportunities and competitions. Use anchors like /business-opportunities#business-competitions.",
    "Users can apply from each card on the category pages.",
  ].join("\n");

export async function buildChatbotContext(query: string): Promise<string> {
  try {
    if (!query.trim()) {
      return buildSiteMap();
    }

    const catalog = await loadCatalog();
    const normalizedQuery = normalizeText(query);
    const domainHint = detectHint(normalizedQuery, DOMAIN_HINTS) as
      | ChatDomain
      | null;
    const kindHint = detectHint(normalizedQuery, KIND_HINTS) as
      | ChatKind
      | null;

    const rawTokens = tokenize(query);
    const tokens = rawTokens.filter((token) => {
      if (Object.values(KIND_HINTS).flat().includes(token)) return false;
      if (Object.values(DOMAIN_HINTS).flat().includes(token)) return false;
      return true;
    });

    const scored = catalog
      .map((item) => {
        let score = 0;
        const fields = item.search;

        for (const token of tokens) {
          if (fields.title.includes(token)) score += 6;
          if (fields.description.includes(token)) score += 3;
          if (fields.organizer.includes(token)) score += 2;
          if (fields.location.includes(token)) score += 2;
          if (fields.tags.includes(token)) score += 3;
          if (fields.type.includes(token)) score += 2;
        }

        if (domainHint && item.domain === domainHint) score += 4;
        if (kindHint && item.kind === kindHint) score += 3;
        if (item.status) score += STATUS_WEIGHT[item.status] || 0;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ item }) => item);

    let matches = scored;
    if (matches.length === 0 && (domainHint || kindHint)) {
      const fallback = catalog.filter((item) => {
        if (domainHint && item.domain !== domainHint) return false;
        if (kindHint && item.kind !== kindHint) return false;
        return true;
      });

      matches = fallback
        .sort((a, b) => {
          const statusA = STATUS_WEIGHT[a.status || ""] || 0;
          const statusB = STATUS_WEIGHT[b.status || ""] || 0;
          if (statusA !== statusB) return statusB - statusA;
          return a.title.localeCompare(b.title);
        })
        .slice(0, 4);
    }

    const lines: string[] = [];
    lines.push(buildSiteMap());

    if (matches.length > 0) {
      lines.push("");
      lines.push("Relevant opportunities and competitions:");
      matches.forEach((match) => {
        lines.push(formatSummaryLine(match));
      });
    }

    return lines.join("\n").trim();
  } catch (error) {
    console.error("Chatbot retrieval error:", error);
    return buildSiteMap();
  }
}
