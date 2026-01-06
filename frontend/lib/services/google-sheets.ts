// [COMPLETE CODE for the sheets utility file]

interface SheetRow {
  [key: string]: string;
}

// Interfaces updated with all new fields for the quiz
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

const SPREADSHEET_ID = "1XHg2kkWfjREQxYIGd4DAcilCBH23BWZz2XRhM1WDJOc";
const COMPETITIONS_SHEET_ID = "0";
const OPPORTUNITIES_SHEET_ID = "530191508";

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
  if (
    !cleanedInput ||
    !cleanedInput.startsWith("[") ||
    !cleanedInput.endsWith("]")
  )
    return [];
  try {
    const validJsonString = cleanedInput.replace(/'/g, '"');
    const tags = JSON.parse(validJsonString);
    if (Array.isArray(tags) && tags.every((t) => typeof t === "string"))
      return tags;
    return [];
  } catch (error) {
    console.error("Failed to parse Grade Tag:", tagString, error);
    return [];
  }
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

function determineStatus(deadline: string, registrationOpens?: string): string {
  const lowerDeadline = (deadline || "").toLowerCase();
  if (lowerDeadline.includes("passed") || lowerDeadline.includes("closed")) {
    return "closed";
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(registrationOpens || "");
  const endDate = new Date(deadline);
  if (!isNaN(startDate.getTime()) && startDate > today) {
    return "upcoming";
  }
  if (!isNaN(endDate.getTime()) && endDate < today) {
    return "closed";
  }
  if (!isNaN(endDate.getTime())) {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    if (endDate <= twoWeeksFromNow) {
      return "closing-soon";
    }
  }
  return "open";
}

function normalizeStatusTag(
  statusTag: string | undefined,
  fallbackStatus: string,
): string {
  // Sheets store status tags as strings like ["Closed"] - clean them up and fall back to our computed status
  const validStatuses = new Set(["open", "closed", "upcoming", "closing-soon"]);
  const cleaned = (statusTag || "")
    .replace(/[\[\]"']/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (!cleaned || !validStatuses.has(cleaned)) {
    return fallbackStatus;
  }

  // When the sheet says "closed" but our date logic says otherwise, trust the dates
  if (cleaned === "closed" && fallbackStatus !== "closed") {
    return fallbackStatus;
  }

  return cleaned;
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

  return {
    id: generateId(title),
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo: cleanupLogoUrl(logoSource),
    gradeTags: parseGradeTags(row["Grade Tag"] || "[]"),
    deadline,
    prize: "TBD",
    status: determineStatus(deadline, registrationOpens),
    description:
      row["Description"] ||
      `${title} - A business competition for high school students.`,
    applicationType: "external",
    applyUrl: row["Link to Application"] || "",
    frequency: "Annual",
    dates: [registrationOpens || "TBD", deadline || "TBD"],
    location: row["Virtual/In-Person"] || "",
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
    status: normalizeStatusTag(
      row["Status Tag"],
      determineStatus(deadline, registrationOpens),
    ),
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
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${COMPETITIONS_SHEET_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok)
      throw new Error(
        `Failed to fetch competitions: ${response.status} ${response.statusText}`,
      );
    const csvData = await response.text();
    if (!csvData || csvData.trim().length === 0)
      throw new Error("Empty response from Google Sheets");
    const rows = parseCSV(csvData);
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
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${OPPORTUNITIES_SHEET_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok)
      throw new Error(
        `Failed to fetch business opportunities: ${response.status} ${response.statusText}`,
      );
    const csvData = await response.text();
    if (!csvData || csvData.trim().length === 0)
      throw new Error("Empty response from Google Sheets");
    const rows = parseCSV(csvData);
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

export async function getCompetitionsSortedByDeadline(): Promise<
  Competition[]
> {
  const competitions = await fetchCompetitionsFromSheets();
  const statusOrder = { upcoming: 1, open: 2, "closing-soon": 2, closed: 3 };
  return competitions.sort((a, b) => {
    const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;
    if (statusA !== statusB) return statusA - statusB;

    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    return dateA.getTime() - dateB.getTime();
  });
}

export async function getBusinessOpportunitiesSorted(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchBusinessOpportunitiesFromSheets();
  const statusOrder = { upcoming: 1, open: 2, "closing-soon": 2, closed: 3 };
  return opportunities.sort((a, b) => {
    const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;
    if (statusA !== statusB) return statusA - statusB;

    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    return dateA.getTime() - dateB.getTime();
  });
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
