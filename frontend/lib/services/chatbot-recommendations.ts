import {
  getChatCatalog,
  type ChatCatalogItem,
  type ChatDomain,
  type ChatKind,
} from "@/lib/services/chatbot-retrieval";

type ChatMessage = {
  role?: string;
  content?: string;
};

type ChatPreferences = {
  domain?: ChatDomain;
  kind?: ChatKind;
  subtype?: string;
  location?: string;
  format?: "virtual" | "in-person";
  grade?: number;
  cost?: "free" | "paid";
  includeClosed?: boolean;
  tokens: string[];
};

const CLARIFY_DOMAIN =
  "Which path are you interested in: Business, Medicine, or Engineering?";
const CLARIFY_KIND = "Are you looking for opportunities or competitions?";
const CLARIFY_SUBTYPE =
  "What type of opportunity: internship, research, volunteering, shadowing, mentorship, or program?";
const CLARIFY_LOCATION =
  "Do you want a specific city in Canada, or are virtual options okay?";

const CLARIFY_QUESTIONS = [
  CLARIFY_DOMAIN,
  CLARIFY_KIND,
  CLARIFY_SUBTYPE,
  CLARIFY_LOCATION,
];

const MAX_RECOMMENDATIONS = 2;

const DOMAIN_SYNONYMS: Record<ChatDomain, string[]> = {
  business: [
    "business",
    "entrepreneur",
    "entrepreneurship",
    "startup",
    "finance",
    "marketing",
    "pitch",
    "case",
  ],
  medicine: [
    "medicine",
    "medical",
    "med",
    "medcine",
    "health",
    "healthcare",
    "clinical",
    "biomed",
    "biology",
  ],
  engineering: [
    "engineering",
    "engineer",
    "eng",
    "stem",
    "robotics",
    "software",
    "computer",
    "coding",
    "electronics",
  ],
};

const KIND_SYNONYMS: Record<ChatKind, string[]> = {
  opportunity: [
    "opportunity",
    "opportunities",
    "oppurtunity",
    "oppurtunities",
    "oppertunity",
    "oppertunities",
    "opps",
    "program",
    "programs",
    "internship",
    "intern",
    "placement",
    "co-op",
    "coop",
    "research",
    "volunteer",
    "volunteering",
    "shadowing",
    "mentorship",
    "fellowship",
    "scholarship",
    "leadership",
    "academy",
  ],
  competition: [
    "competition",
    "competitions",
    "contest",
    "challenge",
    "hackathon",
    "olympiad",
    "case",
    "pitch",
  ],
};

const SUBTYPE_SYNONYMS: Record<string, string[]> = {
  internship: ["internship", "intern", "co-op", "coop", "placement"],
  research: ["research", "lab", "laboratory"],
  volunteering: ["volunteer", "volunteering", "service", "community"],
  shadowing: ["shadowing", "shadow"],
  mentorship: ["mentorship", "mentor", "coaching"],
  leadership: ["leadership", "executive", "captain"],
  scholarship: ["scholarship", "bursary", "award"],
  fellowship: ["fellowship", "fellow"],
  conference: ["conference", "summit"],
  program: ["program", "academy", "bootcamp", "course", "camp"],
  hackathon: ["hackathon"],
  pitch: ["pitch"],
  case: ["case"],
  olympiad: ["olympiad", "olympics"],
};

const NAVIGATION_HINTS = [
  "where",
  "page",
  "navigate",
  "link",
  "site",
  "website",
  "dashboard",
  "login",
  "sign in",
  "sign up",
  "find your opportunity",
];

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  upcoming: "Upcoming",
  "closing-soon": "Closing soon",
  closed: "Closed",
};

const FUTURE_DATE_SCORE = 3;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);

const findBestMatch = (
  normalized: string,
  options: Record<string, string[]>,
): string | undefined => {
  let best: { key: string; hits: number } | null = null;
  Object.entries(options).forEach(([key, words]) => {
    const hits = words.filter((word) => normalized.includes(word)).length;
    if (hits === 0) return;
    if (!best || hits > best.hits) {
      best = { key, hits };
    }
  });
  return best?.key;
};

const getClarifyCount = (messages: ChatMessage[]): number => {
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");
  return assistantMessages.reduce((count, msg) => {
    if (!msg.content) return count;
    return CLARIFY_QUESTIONS.includes(msg.content.trim()) ? count + 1 : count;
  }, 0);
};

const hasAskedQuestion = (
  messages: ChatMessage[],
  question: string,
): boolean =>
  messages.some(
    (msg) =>
      msg.role === "assistant" && (msg.content || "").trim() === question,
  );

const extractGrade = (normalized: string): number | undefined => {
  const match = normalized.match(/\bgrade\s*(\d{1,2})\b/);
  if (match) return Number(match[1]);
  const shortMatch = normalized.match(/\bg(\d{1,2})\b/);
  if (shortMatch) return Number(shortMatch[1]);
  return undefined;
};

const detectFormat = (normalized: string): "virtual" | "in-person" | undefined => {
  if (normalized.includes("virtual") || normalized.includes("online")) {
    return "virtual";
  }
  if (normalized.includes("in person") || normalized.includes("in-person")) {
    return "in-person";
  }
  return undefined;
};

const detectCost = (normalized: string): "free" | "paid" | undefined => {
  if (normalized.includes("free")) return "free";
  if (normalized.includes("paid") || normalized.includes("$")) return "paid";
  return undefined;
};

const parseDateValue = (value?: string): Date | null => {
  const raw = (value || "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const getFutureDateScore = (item: ChatCatalogItem): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = [item.startDate, item.deadline, item.endDate]
    .map((value) => parseDateValue(value))
    .filter((value): value is Date => !!value);
  if (dates.length === 0) return 0;
  const hasFuture = dates.some((date) => date >= today);
  return hasFuture ? FUTURE_DATE_SCORE : 0;
};

const buildLocationIndex = (catalog: ChatCatalogItem[]) => {
  const locations = new Map<string, string>();
  catalog.forEach((item) => {
    if (!item.location) return;
    const raw = item.location.trim();
    if (!raw) return;
    const normalized = normalizeText(raw);
    if (!normalized || normalized.length < 3) return;
    locations.set(normalized, raw);

    raw.split(",").forEach((chunk) => {
      const cleaned = chunk.trim();
      const cleanedNormalized = normalizeText(cleaned);
      if (cleanedNormalized.length >= 3) {
        locations.set(cleanedNormalized, cleaned);
      }
    });
  });
  return locations;
};

const detectLocation = (
  normalized: string,
  catalog: ChatCatalogItem[],
): string | undefined => {
  const locations = buildLocationIndex(catalog);
  let best: { text: string; length: number } | null = null;

  for (const [key, raw] of locations.entries()) {
    if (!normalized.includes(key)) continue;
    if (!best || key.length > best.length) {
      best = { text: raw, length: key.length };
    }
  }
  return best?.text;
};

const matchesSubtype = (item: ChatCatalogItem, subtype: string): boolean => {
  const normalizedSubtype = normalizeText(subtype);
  const synonymKey =
    normalizedSubtype in SUBTYPE_SYNONYMS ? normalizedSubtype : undefined;
  const terms = synonymKey
    ? [normalizedSubtype, ...SUBTYPE_SYNONYMS[synonymKey]]
    : [normalizedSubtype];
  const fields = [
    item.title,
    item.description,
    item.category || "",
    ...(item.opportunityType || []),
    ...(item.subjectArea || []),
  ]
    .map((value) => normalizeText(value))
    .join(" ");

  return terms.some((term) => fields.includes(normalizeText(term)));
};

const isNavigationIntent = (normalized: string): boolean =>
  NAVIGATION_HINTS.some((hint) => normalized.includes(hint));

const shouldHandle = (
  normalized: string,
  domain?: ChatDomain,
  kind?: ChatKind,
  subtype?: string,
): boolean => {
  const hasOpportunitySignal =
    !!domain ||
    !!kind ||
    !!subtype ||
    Object.values(KIND_SYNONYMS)
      .flat()
      .some((term) => normalized.includes(term));

  if (isNavigationIntent(normalized) && !hasOpportunitySignal) {
    return false;
  }
  return hasOpportunitySignal;
};

const formatHeader = (prefs: ChatPreferences): string => {
  const domainLabel = prefs.domain
    ? prefs.domain.charAt(0).toUpperCase() + prefs.domain.slice(1)
    : "Opportunities";
  const kindLabel = prefs.kind
    ? prefs.kind === "competition"
      ? "Competitions"
      : "Opportunities"
    : "";
  const subtypeLabel = prefs.subtype
    ? prefs.subtype.charAt(0).toUpperCase() + prefs.subtype.slice(1)
    : "";

  const parts = [domainLabel];
  if (kindLabel) parts.push(kindLabel);
  if (subtypeLabel) parts.push(subtypeLabel);

  const filters: string[] = [];
  if (prefs.location) filters.push(prefs.location);
  if (prefs.format) filters.push(prefs.format);
  if (prefs.grade) filters.push(`Grade ${prefs.grade}`);
  if (prefs.cost) filters.push(prefs.cost);

  return `${parts.join(" - ")}${filters.length ? ` (${filters.join(", ")})` : ""}`;
};

const buildItemDescriptor = (item: ChatCatalogItem): string => {
  if (item.kind === "competition") {
    const subject = item.subjectArea?.find(Boolean);
    if (subject) return subject;
    if (item.teamRequirement) return item.teamRequirement;
    return "Competition";
  }

  const type = item.opportunityType?.find(Boolean) || "";
  const category = item.category || "";

  if (type && category) {
    const normalizedType = normalizeText(type);
    const normalizedCategory = normalizeText(category);
    if (normalizedCategory.includes(normalizedType)) return category;
    if (normalizedType.includes(normalizedCategory)) return type;
    return `${type} ${category}`;
  }

  return type || category || "Opportunity";
};

const formatItemLine = (
  item: ChatCatalogItem,
  index: number,
  kind?: ChatKind,
): string => {
  const descriptor = buildItemDescriptor(item);
  const statusLabel = STATUS_LABELS[item.status || "open"] || "Open";
  const dateLabel = item.deadline
    ? `Deadline ${item.deadline}`
    : item.endDate
      ? `Ends ${item.endDate}`
      : "";
  const locationLabel = item.location || item.format || "";
  const link = item.url;
  const parts = [
    `${index + 1}) ${item.title}`,
    descriptor,
    statusLabel,
    dateLabel,
    locationLabel,
    link,
  ].filter((part) => part && part.trim().length > 0);

  const labelParts =
    kind && kind !== item.kind
      ? parts.concat(`(${item.kind})`)
      : parts;
  return labelParts.join(" | ");
};

const isClosed = (item: ChatCatalogItem): boolean =>
  item.status === "closed";

const matchesFormat = (
  item: ChatCatalogItem,
  format: "virtual" | "in-person",
): boolean => {
  const haystack = normalizeText(
    [item.format, item.location].filter(Boolean).join(" "),
  );
  if (format === "virtual") {
    return haystack.includes("virtual") || haystack.includes("online");
  }
  return haystack.includes("in person") || haystack.includes("in-person");
};

const matchesLocation = (item: ChatCatalogItem, location: string): boolean => {
  if (!item.location) return false;
  return normalizeText(item.location).includes(normalizeText(location));
};

const matchesGrade = (item: ChatCatalogItem, grade: number): boolean => {
  if (!item.gradeTags || item.gradeTags.length === 0) return false;
  const gradeTag = `grade ${grade}`;
  return item.gradeTags.some(
    (tag) => normalizeText(tag) === normalizeText(gradeTag),
  );
};

const matchesCost = (item: ChatCatalogItem, cost: "free" | "paid"): boolean => {
  if (!item.cost) return false;
  const normalized = normalizeText(item.cost);
  if (cost === "free") return normalized.includes("free");
  return normalized.includes("paid") || normalized.includes("$");
};

const scoreItem = (
  item: ChatCatalogItem,
  prefs: ChatPreferences,
): number => {
  let score = 0;
  const normalizedTitle = normalizeText(item.title);
  const normalizedDescription = normalizeText(item.description);

  prefs.tokens.forEach((token) => {
    if (normalizedTitle.includes(token)) score += 5;
    if (normalizedDescription.includes(token)) score += 2;
  });

  if (prefs.subtype && matchesSubtype(item, prefs.subtype)) score += 6;
  if (prefs.location && matchesLocation(item, prefs.location)) score += 5;
  if (prefs.format && matchesFormat(item, prefs.format)) score += 3;
  if (prefs.grade && matchesGrade(item, prefs.grade)) score += 2;
  if (prefs.cost && matchesCost(item, prefs.cost)) score += 2;

  if (item.status === "closing-soon") score += 4;
  if (item.status === "open") score += 3;
  if (item.status === "upcoming") score += 2;
  score += getFutureDateScore(item);
  return score;
};

const buildRecommendations = (
  catalog: ChatCatalogItem[],
  prefs: ChatPreferences,
) => {
  const baseFiltered = catalog.filter((item) => {
    if (prefs.domain && item.domain !== prefs.domain) return false;
    if (prefs.kind && item.kind !== prefs.kind) return false;
    if (prefs.format && !matchesFormat(item, prefs.format)) return false;
    if (prefs.location && !matchesLocation(item, prefs.location)) return false;
    if (prefs.grade && !matchesGrade(item, prefs.grade)) return false;
    if (prefs.cost && !matchesCost(item, prefs.cost)) return false;
    return true;
  });

  const subtypeFiltered = prefs.subtype
    ? baseFiltered.filter((item) => matchesSubtype(item, prefs.subtype || ""))
    : baseFiltered;
  const preferredSubtype =
    prefs.subtype && subtypeFiltered.length > 0 ? subtypeFiltered : baseFiltered;

  const statusFiltered = prefs.includeClosed
    ? preferredSubtype
    : preferredSubtype.filter((item) => !isClosed(item));
  const preferredStatus =
    statusFiltered.length > 0 ? statusFiltered : preferredSubtype;

  const scored = preferredStatus
    .map((item) => ({ item, score: scoreItem(item, prefs) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  return scored.slice(0, MAX_RECOMMENDATIONS);
};

const pickClarifyingQuestion = (
  prefs: ChatPreferences,
  messages: ChatMessage[],
  hasAskedMax: boolean,
  wantsLocation: boolean,
): string | null => {
  if (hasAskedMax) return null;
  if (!prefs.domain && !hasAskedQuestion(messages, CLARIFY_DOMAIN))
    return CLARIFY_DOMAIN;
  if (!prefs.kind && !hasAskedQuestion(messages, CLARIFY_KIND))
    return CLARIFY_KIND;
  if (
    prefs.kind === "opportunity" &&
    !prefs.subtype &&
    !hasAskedQuestion(messages, CLARIFY_SUBTYPE)
  )
    return CLARIFY_SUBTYPE;
  if (
    wantsLocation &&
    !prefs.location &&
    !hasAskedQuestion(messages, CLARIFY_LOCATION)
  )
    return CLARIFY_LOCATION;
  return null;
};

const inferSubtype = (normalized: string): string | undefined => {
  const match = findBestMatch(normalized, SUBTYPE_SYNONYMS);
  return match;
};

const inferKindFromSubtype = (subtype: string | undefined): ChatKind | undefined => {
  if (!subtype) return undefined;
  if (["hackathon", "case", "olympiad", "pitch"].includes(subtype)) {
    return "competition";
  }
  return "opportunity";
};

export async function buildChatbotRecommendationReply(
  messages: ChatMessage[],
): Promise<string | null> {
  const userMessages = messages.filter((msg) => msg.role === "user");
  if (userMessages.length === 0) return null;

  const recentText = userMessages
    .slice(-3)
    .map((msg) => msg.content || "")
    .join(" ");
  const normalized = normalizeText(recentText);

  const domain =
    (findBestMatch(normalized, DOMAIN_SYNONYMS) as ChatDomain) || undefined;
  let kind = (findBestMatch(normalized, KIND_SYNONYMS) as ChatKind) || undefined;
  const subtype = inferSubtype(normalized);
  const subtypeKind = inferKindFromSubtype(subtype);
  if (!kind && subtypeKind) kind = subtypeKind;

  if (!shouldHandle(normalized, domain, kind, subtype)) {
    return null;
  }

  const catalog = await getChatCatalog();
  const location = detectLocation(normalized, catalog);
  const format = detectFormat(normalized);
  const grade = extractGrade(normalized);
  const cost = detectCost(normalized);
  const includeClosed =
    normalized.includes("closed") || normalized.includes("past");

  const tokens = tokenize(normalized);

  const prefs: ChatPreferences = {
    domain,
    kind,
    subtype,
    location,
    format,
    grade,
    cost,
    includeClosed,
    tokens,
  };

  const wantsLocation =
    normalized.includes("near") ||
    normalized.includes("closest") ||
    normalized.includes("in person") ||
    normalized.includes("in-person") ||
    normalized.includes("city");

  const clarifyCount = getClarifyCount(messages);
  const clarifyingQuestion = pickClarifyingQuestion(
    prefs,
    messages,
    clarifyCount >= 2,
    wantsLocation,
  );
  if (clarifyingQuestion) {
    return clarifyingQuestion;
  }

  const matches = buildRecommendations(catalog, prefs);

  if (matches.length === 0) {
    return [
      "I could not find a strong match with those filters.",
      "Tell me a different type or location and I will try again.",
    ].join(" ");
  }

  const lines = [formatHeader(prefs)];
  matches.forEach((item, index) => {
    lines.push(formatItemLine(item, index, prefs.kind));
  });
  lines.push(
    "If you want to narrow this, tell me grade, location, format, or cost.",
  );
  return lines.join("\n");
}
