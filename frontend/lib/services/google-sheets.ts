// [CORRECTED AND COMPLETE GOOGLE SHEETS UTILITY FILE]

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
  cost: string;
  registrationOpens?: string;
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
  format: string;
  status: string;
  description: string;
  applicationType: string;
  applyUrl: string;
  category: string;
}

const SPREADSHEET_ID = "1XHg2kkWfjREQxYIGd4DAcilCBH23BWZz2XRhM1WDJOc";
const COMPETITIONS_SHEET_ID = "0";
const OPPORTUNITIES_SHEET_ID = "530191508";

function parseCSV(csvData: string): SheetRow[] {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows: SheetRow[] = [];
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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

function parseGradeTags(tagString: string): string[] {
  if (!tagString || !tagString.startsWith("[") || !tagString.endsWith("]")) return [];
  try {
    const validJsonString = tagString.replace(/'/g, '"');
    const tags = JSON.parse(validJsonString);
    if (Array.isArray(tags) && tags.every(t => typeof t === 'string')) return tags;
    return [];
  } catch (error) {
    console.error("Failed to parse Grade Tag:", tagString, error);
    return [];
  }
}

function generateId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 50);
}

function cleanupLogoUrl(url: string): string {
  if (!url || url.trim() === "") return "/logos/placeholder.svg";
  if (url.includes("google.com/url?")) {
    try {
      const urlObj = new URL(url);
      const actualUrl = urlObj.searchParams.get("url");
      if (actualUrl) return decodeURIComponent(actualUrl);
    } catch { return "/logos/placeholder.svg"; }
  }
  try { new URL(url); return url; }
  catch { return "/logos/placeholder.svg"; }
}

function mapRowToCompetition(row: SheetRow): Competition {
  const title = row["Name"] || "";
  const deadline = row["Deadline"] || "";
  const description = row["Description"] || `${title} - A business competition for high school students.`;

  let status = "open";
  if (deadline.toLowerCase().includes("passed") || deadline.toLowerCase().includes("closed")) status = "closed";
  else if (deadline.toLowerCase().includes("soon") || deadline.toLowerCase().includes("this month")) status = "closing-soon";

  let formattedDeadline = deadline;
  try {
    if (deadline && deadline !== "Not explicitly stated" && !deadline.includes("TBD")) {
      const parsed = new Date(deadline);
      if (!isNaN(parsed.getTime())) formattedDeadline = parsed.toISOString();
    }
  } catch {}

  return {
    id: generateId(title),
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo: cleanupLogoUrl(row["Logo Link"] || ""),
    gradeTags: parseGradeTags(row["Grade Tag"] || "[]"),
    deadline: formattedDeadline || deadline || "TBD",
    prize: "TBD",
    status,
    description,
    applicationType: "external",
    applyUrl: row["Link to Application"] || "",
    frequency: "Annual",
    dates: [new Date().toISOString().split("T")[0], formattedDeadline || deadline || new Date().toISOString().split("T")[0]],
    location: row["Virtual/In-Person"] || "",
    cost: row["Cost"] || "",
    registrationOpens: row["When Registration Opens,"] || "",
  };
}

function mapRowToBusinessOpportunity(row: SheetRow): BusinessOpportunity {
  const title = row["Name"] || "";
  const registrationOpens = row["When Registration Opens,"] || "";
  const deadline = row["Deadline"] || "";
  const description = row["Description"] || `${title} - A business opportunity for high school students.`;

  let status = "open";
  if (deadline.toLowerCase().includes("passed") || deadline.toLowerCase().includes("closed")) status = "closed";
  else if (registrationOpens.toLowerCase().includes("none") || registrationOpens.toLowerCase().includes("tbd")) status = "upcoming";

  let category = "Program";
  if (title.toLowerCase().includes("internship")) category = "Internship";
  else if (title.toLowerCase().includes("fellowship")) category = "Fellowship";
  else if (title.toLowerCase().includes("academy") || title.toLowerCase().includes("school")) category = "Business Academy";
  else if (title.toLowerCase().includes("leadership")) category = "Leadership Program";
  else if (title.toLowerCase().includes("entrepreneur")) category = "Entrepreneurship Program";
  else if (title.toLowerCase().includes("conference")) category = "Conference";
  else if (title.toLowerCase().includes("scholarship")) category = "Scholarship Program";

  return {
    id: generateId(title),
    title,
    organizer: title.split(" ")[0] || "Unknown",
    logo: cleanupLogoUrl(row["Logo Image "] || row["Logo Image"] || row["Logo Link"] || ""),
    gradeTags: parseGradeTags(row["Grade Tag"] || "[]"),
    startDate: registrationOpens || "TBD",
    endDate: deadline || "TBD",
    cost: row["Cost"] || "",
    format: row["Virtual/In-Person"] || "",
    status,
    description,
    applicationType: "external",
    applyUrl: row["Link to Application"] || "",
    category,
  };
}

export async function fetchCompetitionsFromSheets(): Promise<Competition[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${COMPETITIONS_SHEET_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Failed to fetch competitions: ${response.status} ${response.statusText}`);
    const csvData = await response.text();
    if (!csvData || csvData.trim().length === 0) throw new Error("Empty response from Google Sheets");
    const rows = parseCSV(csvData);
    return rows.filter((row) => row["Name"] && row["Name"].trim() !== "").map(mapRowToCompetition);
  } catch (error) {
    console.error("Error fetching competitions from Google Sheets:", error);
    throw error;
  }
}

export async function fetchBusinessOpportunitiesFromSheets(): Promise<BusinessOpportunity[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${OPPORTUNITIES_SHEET_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Failed to fetch business opportunities: ${response.status} ${response.statusText}`);
    const csvData = await response.text();
    if (!csvData || csvData.trim().length === 0) throw new Error("Empty response from Google Sheets");
    const rows = parseCSV(csvData);
    return rows.filter((row) => row["Name"] && row["Name"].trim() !== "").map(mapRowToBusinessOpportunity);
  } catch (error) {
    console.error("Error fetching business opportunities from Google Sheets:", error);
    throw error;
  }
}

export async function getCompetitionsSortedByDeadline(): Promise<Competition[]> {
  const competitions = await fetchCompetitionsFromSheets();
  return competitions.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}

export async function getBusinessOpportunitiesSorted(): Promise<BusinessOpportunity[]> {
  const opportunities = await fetchBusinessOpportunitiesFromSheets();
  return opportunities.sort((a, b) => {
    const statusOrder = { open: 1, upcoming: 2, closed: 3 };
    const statusA = statusOrder[a.status as keyof typeof statusOrder] || 4;
    const statusB = statusOrder[b.status as keyof typeof statusOrder] || 4;
    if (statusA !== statusB) return statusA - statusB;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

export type { Competition, BusinessOpportunity };
