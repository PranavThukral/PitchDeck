
import { STATUS_ORDER } from "@/lib/utils/status";

interface SheetRow {
  [key: string]: string;
}

interface Competition {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  deadline: string;
  prize: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  frequency: string;
  dates: [string, string];
  location: string;
  cost: string; // The display cost, e.g., "$40 CAD"
  costNumeric: number; // The filterable cost, e.g., 40
  teamRequirement: string;
  subjectArea: string[];
  registrationOpens?: string;
  likes: number; // Like count from Google Sheets
}

interface BusinessOpportunity {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeTags: string[];
  startDate: string;
  endDate: string;
  cost: string;
  costNumeric: number;
  format: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  category: string;
  opportunityType: string[];
  duration: string;
  timeCommitment: string;
  likes: number; // Like count from Google Sheets
}

const SPREADSHEET_ID = "1a0_JfkOsRG_xPOr5ZjkRGKnlrvskxA_LepiKef5oiHg";
const COMPETITIONS_SHEET_ID = "0";
const OPPORTUNITIES_SHEET_ID = "530191508";
const MEDICINE_OPPORTUNITIES_SHEET_ID = "352298986";
const MEDICINE_COMPETITIONS_SHEET_ID = "2091744259";
const ENGINEERING_OPPORTUNITIES_SHEET_ID = "1845076928";
const ENGINEERING_COMPETITIONS_SHEET_ID = "1387527132";

const logoOverrides: Record<string, string> = {
  "blue ocean competition": "/logos/organizations/blue-ocean.png",
  "sunlife dbts": "/logos/business-opportunities/sunlife.svg",
  "icon talent - scholars": "/logos/business-opportunities/icon-talent.jpg",
  "icon fellowship": "/logos/business-opportunities/icon-talent.jpg",
  "ta stc regional executive": "/logos/business-opportunities/target-alpha.jpg",
  "target alpha": "/logos/business-opportunities/target-alpha.jpg",
};

function parseCSV(csvData: string): SheetRow[] {
  // Robust CSV parser that respects quoted fields with embedded commas/newlines
  const normalized = csvData.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawRows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    currentRow.push(currentField);
    currentField = "";
  };

  const pushRow = () => {
    // Skip empty rows that can appear from stray newlines
    if (currentRow.every((value) => value.trim() === "")) {
      currentRow = [];
      return;
    }
    rawRows.push(currentRow);
    currentRow = [];
  };

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushField();
      continue;
    }

    if (char === "\n" && !inQuotes) {
      pushField();
      pushRow();
      continue;
    }

    currentField += char;
  }

  // Capture the final field/row
  pushField();
  pushRow();

  if (rawRows.length < 2) return [];

  const headers = rawRows[0].map((header) => header.trim());
  return rawRows.slice(1).reduce<SheetRow[]>((rows, values) => {
    const row: SheetRow = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });
    if (row["Name"] && row["Name"].trim() !== "") {
      rows.push(row);
    }
    return rows;
  }, []);
}

function parseGradeTags(tagString: string): string[] {
  const cleanedInput = (tagString || "").replace(/[\r\n]+/g, "").trim();
  if (!cleanedInput) return [];

  if (cleanedInput.startsWith("[") && cleanedInput.endsWith("]")) {
    try {
      const validJsonString = cleanedInput.replace(/'/g, '"');
      const tags = JSON.parse(validJsonString);
      if (Array.isArray(tags) && tags.every((t) => typeof t === "string")) {
        return tags;
      }
    } catch {
      // Fall back to non-JSON list parsing.
    }
  }

  const normalized = cleanedInput.replace(/^\[|\]$/g, "");
  const tags = normalized
    .split(/[,;]+/)
    .map((value) => value.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
  return tags.length > 0 ? tags : [];
}

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function cleanupLogoUrl(url: string): string {
  if (!url || url.trim() === "") return "/logos/placeholder.svg";
  const imageExtensions = /\.(jpeg|jpg|gif|png|svg|webp)$/i;
  if (!imageExtensions.test(url.split("?")[0])) {
    return "/logos/placeholder.svg";
  }
  if (url.includes("google.com/url?")) {
    try {
      const urlObj = new URL(url);
      const actualUrl = urlObj.searchParams.get("url");
      if (actualUrl) return decodeURIComponent(actualUrl);
    } catch {
      return "/logos/placeholder.svg";
    }
  }
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    if (url.startsWith("/")) return url;
    return "/logos/placeholder.svg";
  }
}

const INVALID_DATE_TOKENS = [
  "tbd",
  "does not specify",
  "none",
  "none yet",
  "n/a",
  "na",
  "unknown",
  "not specified",
];

function parseDateValue(value: string | undefined): Date | null {
  const raw = (value || "").trim();
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  if (INVALID_DATE_TOKENS.some((token) => normalized.includes(token))) {
    return null;
  }
  const date = new Date(raw);
  if (isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function determineStatus({
  opensAt,
  closesAt,
}: {
  opensAt?: string;
  closesAt?: string;
}): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openDate = parseDateValue(opensAt);
  const closeDate = parseDateValue(closesAt);

  if (closeDate && closeDate < today) {
    return "closed";
  }

  if (openDate && openDate > today) {
    const upcomingThreshold = new Date(today);
    upcomingThreshold.setDate(today.getDate() + 30);
    if (openDate <= upcomingThreshold) {
      return "upcoming";
    }
    return "closed";
  }

  if (closeDate) {
    const closingSoonThreshold = new Date(today);
    closingSoonThreshold.setDate(today.getDate() + 7);
    if (closeDate >= today && closeDate <= closingSoonThreshold) {
      return "closing-soon";
    }
    return "open";
  }

  if (openDate && openDate <= today) {
    return "open";
  }

  return "closed";
}

// Helper to parse tags from single-entry columns
function parseSingleTag(tagString: string): string[] {
  const cleaned = (tagString || "").replace(/[\r\n]+/g, " ").trim();
  if (!cleaned) return [];
  return [cleaned];
}

// Helper to parse the cost column
function parseCost(costString: string): number {
  if (!costString || costString.toLowerCase().includes("free")) {
    return 0;
  }
  const matches = costString.match(/\d+/);
  return matches ? parseInt(matches[0], 10) : -1;
}

function mapRowToCompetition(row: SheetRow): Competition {
  const title = row["Name"] || "";
  const deadline = row["Deadline"] || "";
  const registrationOpens = row["When Registration Opens,"] || "";
  const normalizedTitle = title.trim().toLowerCase();
  const logoSource = logoOverrides[normalizedTitle] ?? row["Logo Link"] ?? "";
  const location =
    row["Location"] ||
    row["City, Province"] ||
    row["City"] ||
    row["Virtual/In-Person"] ||
    "";

  return {
    id: generateId(title),
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo: cleanupLogoUrl(logoSource),
    gradeTags: parseGradeTags(row["Grade Tag"] || "[]"),
    deadline,
    prize: "TBD",
    status: determineStatus({ opensAt: registrationOpens, closesAt: deadline }),
    description:
      row["Description"] ||
      `${title} - A business competition for high school students.`,
    applicationType: "external",
    applyUrl: row["Link to Application"] || "",
    frequency: "Annual",
    dates: [registrationOpens || "TBD", deadline || "TBD"],
    location,
    cost: row["Cost"] || "Free",
    costNumeric: parseCost(row["Cost"] || ""),
    teamRequirement: row["Team Requirement"] || "Both",
    subjectArea: parseSingleTag(row["Subject Area"] || ""),
    registrationOpens,
    likes: parseInt(row["Likes"] || "0", 10) || 0,
  };
}

function mapRowToBusinessOpportunity(row: SheetRow): BusinessOpportunity {
  const title = row["Name"] || "";
  const registrationOpens = row["When Registration Opens,"] || "";
  const deadline = row["Deadline"] || "";
  const normalizedTitle = title.trim().toLowerCase();
  const rawLogo =
    logoOverrides[normalizedTitle] ??
    row["Logo Image "] ??
    row["Logo Image"] ??
    row["Logo Link"] ??
    "";
  let category = "Program";
  if (title.toLowerCase().includes("internship")) category = "Internship";
  else if (title.toLowerCase().includes("fellowship")) category = "Fellowship";
  else if (
    title.toLowerCase().includes("academy") ||
    title.toLowerCase().includes("school")
  )
    category = "Business Academy";
  else if (title.toLowerCase().includes("leadership"))
    category = "Leadership Program";
  else if (title.toLowerCase().includes("entrepreneur"))
    category = "Entrepreneurship Program";
  else if (title.toLowerCase().includes("conference")) category = "Conference";
  else if (title.toLowerCase().includes("scholarship"))
    category = "Scholarship Program";

  return {
    id: generateId(title),
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo: cleanupLogoUrl(rawLogo),
    gradeTags: parseGradeTags(row["Grade Tag"] || "[]"),
    startDate: registrationOpens || "TBD",
    endDate: deadline || "TBD",
    cost: row["Cost"] || "Free",
    costNumeric: parseCost(row["Cost"] || ""),
    format: row["Virtual/In-Person"] || "",
    status: determineStatus({ opensAt: registrationOpens, closesAt: deadline }),
    description:
      row["Description"] ||
      `${title} - A business opportunity for high school students.`,
    applicationType: "external",
    applyUrl: row["Link to Application"] || "",
    category,
    opportunityType: parseSingleTag(
      row["Opportunity Type"] || row["Oppurtunity Type"] || "",
    ),
    duration: row["Duration"] || "",
    timeCommitment: row["Time Commitment"] || "",
    likes: parseInt(row["Likes"] || "0", 10) || 0,
  };
}

export async function fetchCompetitionsFromSheets(): Promise<Competition[]> {
  return fetchCompetitionsFromSheet(COMPETITIONS_SHEET_ID);
}

export async function fetchMedicineCompetitionsFromSheets(): Promise<
  Competition[]
> {
  return fetchCompetitionsFromSheet(MEDICINE_COMPETITIONS_SHEET_ID);
}

export async function fetchEngineeringCompetitionsFromSheets(): Promise<
  Competition[]
> {
  return fetchCompetitionsFromSheet(ENGINEERING_COMPETITIONS_SHEET_ID);
}

async function fetchCompetitionsFromSheet(
  sheetId: string,
): Promise<Competition[]> {
  try {
    const rows = await fetchSheetRows(sheetId, "competitions");
    return rows
      .filter((row) => row["Name"] && row["Name"].trim() !== "")
      .map(mapRowToCompetition);
  } catch (error) {
    console.error("Error fetching competitions from Google Sheets:", error);
    throw error;
  }
}

export async function fetchBusinessOpportunitiesFromSheets(): Promise<
  BusinessOpportunity[]
> {
  return fetchBusinessOpportunitiesFromSheet(OPPORTUNITIES_SHEET_ID);
}

export async function fetchMedicineOpportunitiesFromSheets(): Promise<
  BusinessOpportunity[]
> {
  return fetchBusinessOpportunitiesFromSheet(MEDICINE_OPPORTUNITIES_SHEET_ID);
}

export async function fetchEngineeringOpportunitiesFromSheets(): Promise<
  BusinessOpportunity[]
> {
  return fetchBusinessOpportunitiesFromSheet(ENGINEERING_OPPORTUNITIES_SHEET_ID);
}

async function fetchBusinessOpportunitiesFromSheet(
  sheetId: string,
): Promise<BusinessOpportunity[]> {
  try {
    const rows = await fetchSheetRows(sheetId, "opportunities");
    return rows
      .filter((row) => row["Name"] && row["Name"].trim() !== "")
      .map(mapRowToBusinessOpportunity);
  } catch (error) {
    console.error(
      "Error fetching business opportunities from Google Sheets:",
      error,
    );
    throw error;
  }
}

async function fetchSheetRows(
  sheetId: string,
  label: string,
): Promise<SheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetId}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${label}: ${response.status} ${response.statusText}`,
    );
  }
  const csvData = await response.text();
  if (!csvData || csvData.trim().length === 0) {
    throw new Error("Empty response from Google Sheets");
  }
  return parseCSV(csvData);
}

function sortCompetitionsByDeadline(competitions: Competition[]): Competition[] {
  return competitions.sort((a, b) => {
    const statusA = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 4;
    const statusB = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 4;
    if (statusA !== statusB) return statusA - statusB;

    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    return dateA.getTime() - dateB.getTime();
  });
}

function sortOpportunitiesByDeadline(
  opportunities: BusinessOpportunity[],
): BusinessOpportunity[] {
  return opportunities.sort((a, b) => {
    const statusA = STATUS_ORDER[a.status as keyof typeof STATUS_ORDER] || 4;
    const statusB = STATUS_ORDER[b.status as keyof typeof STATUS_ORDER] || 4;
    if (statusA !== statusB) return statusA - statusB;

    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    return dateA.getTime() - dateB.getTime();
  });
}

export async function getCompetitionsSortedByDeadline(): Promise<
  Competition[]
> {
  const competitions = await fetchCompetitionsFromSheets();
  return sortCompetitionsByDeadline(competitions);
}

export async function getMedicineCompetitionsSortedByDeadline(): Promise<
  Competition[]
> {
  const competitions = await fetchMedicineCompetitionsFromSheets();
  return sortCompetitionsByDeadline(competitions);
}

export async function getEngineeringCompetitionsSortedByDeadline(): Promise<
  Competition[]
> {
  const competitions = await fetchEngineeringCompetitionsFromSheets();
  return sortCompetitionsByDeadline(competitions);
}

export async function getBusinessOpportunitiesSorted(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchBusinessOpportunitiesFromSheets();
  return sortOpportunitiesByDeadline(opportunities);
}

export async function getMedicineOpportunitiesSorted(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchMedicineOpportunitiesFromSheets();
  return sortOpportunitiesByDeadline(opportunities);
}

export async function getEngineeringOpportunitiesSorted(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchEngineeringOpportunitiesFromSheets();
  return sortOpportunitiesByDeadline(opportunities);
}

export async function getBusinessOpportunitiesSortedByDeadline(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchBusinessOpportunitiesFromSheets();
  return opportunities.sort((a, b) => {
    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    return dateA.getTime() - dateB.getTime();
  });
}

export type { Competition, BusinessOpportunity };
