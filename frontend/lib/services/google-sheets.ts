interface SheetRow {
  [key: string]: string;
}

interface Competition {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeEligibility: string;
  deadline: string;
  prize: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  frequency: string;
  dates: [string, string];
  location: string;
  cost: string;
  registrationOpens?: string;
}

interface BusinessOpportunity {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  gradeEligibility: string;
  startDate: string;
  endDate: string;
  cost: string;
  format: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  category: string;
}

const SPREADSHEET_ID = "1XHg2kkWfjREQxYIGd4DAcilCBH23BWZz2XRhM1WDJOc";
const COMPETITIONS_SHEET_ID = "0"; // Business Competitions sheet
const OPPORTUNITIES_SHEET_ID = "530191508"; // Business Opportunities sheet

/**
 * Parse CSV data into array of objects with proper handling of quotes and commas
 */
function parseCSV(csvData: string): SheetRow[] {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows: SheetRow[] = [];

  // Parse each data row
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length > 0 && values[0].trim() !== "") {
      const row: SheetRow = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || "").trim();
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quotes and embedded commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim().replace(/^"|"$/g, ""));

  return result;
}

/**
 * Generate a unique ID from the title
 */
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

/**
 * Clean up logo URLs to handle Google redirects and invalid URLs
 */
function cleanupLogoUrl(url: string): string {
  if (!url || url.trim() === "") {
    return "/logos/placeholder.svg";
  }

  // Handle Google redirect URLs - extract the actual URL
  if (url.includes("google.com/url?")) {
    try {
      const urlObj = new URL(url);
      const actualUrl = urlObj.searchParams.get("url");
      if (actualUrl) {
        return decodeURIComponent(actualUrl);
      }
    } catch {
      // If parsing fails, fall back to placeholder
      return "/logos/placeholder.svg";
    }
  }

  // Check if it's a valid URL
  try {
    new URL(url);
    return url;
  } catch {
    return "/logos/placeholder.svg";
  }
}

/**
 * Convert sheet row to Competition object
 */
function mapRowToCompetition(row: SheetRow): Competition {
  const id = generateId(row["Name"] || "");
  const title = row["Name"] || "";
  const applyUrl = row["Link to Application"] || "";
  const registrationOpens = row["When Registration Opens,"] || "";
  const deadline = row["Deadline"] || "";
  const cost = row["Cost"] || "";
  const location = row["Virtual/In-Person"] || "";
  const logo = cleanupLogoUrl(row["Logo Link"] || "");

  // Determine status based on deadline and registration info
  let status = "open";
  if (
    deadline.toLowerCase().includes("passed") ||
    deadline.toLowerCase().includes("closed")
  ) {
    status = "closed";
  } else if (
    deadline.toLowerCase().includes("soon") ||
    deadline.toLowerCase().includes("this month")
  ) {
    status = "closing-soon";
  }

  // Convert deadline to a proper date format if possible
  let formattedDeadline = deadline;
  try {
    if (
      deadline &&
      deadline !== "Not explicitly stated" &&
      !deadline.includes("TBD")
    ) {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) {
        formattedDeadline = parsed.toISOString();
      }
    }
  } catch {
    // Keep original deadline if parsing fails
  }

  return {
    id,
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo,
    gradeEligibility: "High School Students",
    deadline: formattedDeadline || deadline || "TBD",
    prize: "TBD",
    status,
    description: `${title} - A business competition for high school students.`,
    applicationType: "external",
    applyUrl,
    frequency: "Annual",
    dates: [
      new Date().toISOString().split("T")[0],
      formattedDeadline || deadline || new Date().toISOString().split("T")[0],
    ],
    location,
    cost,
    registrationOpens,
  };
}

/**
 * Convert sheet row to BusinessOpportunity object
 */
function mapRowToBusinessOpportunity(row: SheetRow): BusinessOpportunity {
  const id = generateId(row["Name"] || "");
  const title = row["Name"] || "";
  const applyUrl = row["Link to Application"] || "";
  const registrationOpens = row["When Registration Opens,"] || "";
  const deadline = row["Deadline"] || "";
  const cost = row["Cost"] || "";
  const format = row["Virtual/In-Person"] || "";
  const logo = cleanupLogoUrl(
    row["Logo Image "] || row["Logo Image"] || row["Logo Link"] || "",
  );

  // Determine status
  let status = "open";
  if (
    deadline.toLowerCase().includes("passed") ||
    deadline.toLowerCase().includes("closed")
  ) {
    status = "closed";
  } else if (
    registrationOpens.toLowerCase().includes("none") ||
    registrationOpens.toLowerCase().includes("tbd")
  ) {
    status = "upcoming";
  }

  // Determine category based on title
  let category = "Program";
  if (title.toLowerCase().includes("internship")) {
    category = "Internship";
  } else if (title.toLowerCase().includes("fellowship")) {
    category = "Fellowship";
  } else if (
    title.toLowerCase().includes("academy") ||
    title.toLowerCase().includes("school")
  ) {
    category = "Business Academy";
  } else if (title.toLowerCase().includes("leadership")) {
    category = "Leadership Program";
  } else if (title.toLowerCase().includes("entrepreneur")) {
    category = "Entrepreneurship Program";
  } else if (title.toLowerCase().includes("conference")) {
    category = "Conference";
  } else if (title.toLowerCase().includes("scholarship")) {
    category = "Scholarship Program";
  }

  return {
    id,
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo,
    gradeEligibility: "High School Students",
    startDate: registrationOpens || "TBD",
    endDate: deadline || "TBD",
    cost,
    format,
    status,
    description: `${title} - A business opportunity for high school students.`,
    applicationType: "external",
    applyUrl,
    category,
  };
}

/**
 * Fetch competitions from Google Sheets
 */
export async function fetchCompetitionsFromSheets(): Promise<Competition[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${COMPETITIONS_SHEET_ID}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/csv,text/plain,*/*",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch competitions: ${response.status} ${response.statusText}`,
      );
    }

    const csvData = await response.text();

    if (!csvData || csvData.trim().length === 0) {
      throw new Error("Empty response from Google Sheets");
    }

    const rows = parseCSV(csvData);

    const competitions = rows
      .filter((row) => row["Name"] && row["Name"].trim() !== "")
      .map(mapRowToCompetition);

    return competitions;
  } catch (error) {
    console.error("Error fetching competitions from Google Sheets:", error);
    throw error;
  }
}

/**
 * Fetch business opportunities from Google Sheets
 */
export async function fetchBusinessOpportunitiesFromSheets(): Promise<
  BusinessOpportunity[]
> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${OPPORTUNITIES_SHEET_ID}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/csv,text/plain,*/*",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch business opportunities: ${response.status} ${response.statusText}`,
      );
    }

    const csvData = await response.text();

    if (!csvData || csvData.trim().length === 0) {
      throw new Error("Empty response from Google Sheets");
    }

    const rows = parseCSV(csvData);

    const opportunities = rows
      .filter((row) => row["Name"] && row["Name"].trim() !== "")
      .map(mapRowToBusinessOpportunity);

    return opportunities;
  } catch (error) {
    console.error(
      "Error fetching business opportunities from Google Sheets:",
      error,
    );
    throw error;
  }
}

/**
 * Get competitions sorted by deadline (earliest first)
 */
export async function getCompetitionsSortedByDeadline(): Promise<
  Competition[]
> {
  const competitions = await fetchCompetitionsFromSheets();
  return competitions.sort((a, b) => {
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    return dateA - dateB;
  });
}

/**
 * Get business opportunities sorted by start date
 */
export async function getBusinessOpportunitiesSorted(): Promise<
  BusinessOpportunity[]
> {
  const opportunities = await fetchBusinessOpportunitiesFromSheets();
  return opportunities.sort((a, b) => {
    // Sort by status first (open > upcoming > closed), then by start date
    const statusOrder = { open: 1, upcoming: 2, closed: 3 };
    const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // If same status, sort by start date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

export type { Competition, BusinessOpportunity };
