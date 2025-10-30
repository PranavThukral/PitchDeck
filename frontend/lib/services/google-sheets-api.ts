import { google } from 'googleapis';

// Google Sheets configuration
const SPREADSHEET_ID = "1XHg2kkWfjREQxYIGd4DAcilCBH23BWZz2XRhM1WDJOc";
const COMPETITIONS_SHEET_NAME = "Competitions";
const OPPORTUNITIES_SHEET_NAME = "Business Opportunities";

// Cache for sheet data to find row numbers
interface SheetCache {
  competitions: Map<string, number>; // itemId -> row number
  opportunities: Map<string, number>; // itemId -> row number
  lastUpdated: number;
}

let sheetCache: SheetCache = {
  competitions: new Map(),
  opportunities: new Map(),
  lastUpdated: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize Google Sheets API client
 */
function getGoogleSheetsClient() {
  try {
    // Try to use service account credentials from environment
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (credentials) {
      const parsedCredentials = JSON.parse(credentials);
      const auth = new google.auth.GoogleAuth({
        credentials: parsedCredentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      return google.sheets({ version: 'v4', auth });
    }

    // Fallback to API key (read-only)
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    if (apiKey) {
      return google.sheets({ version: 'v4', auth: apiKey });
    }

    throw new Error('No Google Sheets credentials found');
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw new Error('Google Sheets API not configured');
  }
}

/**
 * Generate item ID from title (same logic as in google-sheets.ts)
 */
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

/**
 * Update cache with current sheet data
 */
async function updateSheetCache(): Promise<void> {
  const now = Date.now();

  // Skip if cache is still valid
  if (now - sheetCache.lastUpdated < CACHE_DURATION) {
    return;
  }

  try {
    const sheets = getGoogleSheetsClient();

    // Fetch competitions sheet
    const competitionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${COMPETITIONS_SHEET_NAME}!A:B`, // Name and Likes columns
    });

    const competitionsRows = competitionsResponse.data.values || [];
    sheetCache.competitions.clear();

    // Start from row 2 (skip header)
    for (let i = 1; i < competitionsRows.length; i++) {
      const row = competitionsRows[i];
      if (row && row[0]) { // If there's a name in column A
        const itemId = generateId(row[0]);
        sheetCache.competitions.set(itemId, i + 1); // +1 because sheets are 1-indexed
      }
    }

    // Fetch opportunities sheet
    const opportunitiesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${OPPORTUNITIES_SHEET_NAME}!A:B`, // Name and Likes columns
    });

    const opportunitiesRows = opportunitiesResponse.data.values || [];
    sheetCache.opportunities.clear();

    // Start from row 2 (skip header)
    for (let i = 1; i < opportunitiesRows.length; i++) {
      const row = opportunitiesRows[i];
      if (row && row[0]) { // If there's a name in column A
        const itemId = generateId(row[0]);
        sheetCache.opportunities.set(itemId, i + 1); // +1 because sheets are 1-indexed
      }
    }

    sheetCache.lastUpdated = now;
    console.log(`📊 Sheet cache updated: ${sheetCache.competitions.size} competitions, ${sheetCache.opportunities.size} opportunities`);

  } catch (error) {
    console.error('Failed to update sheet cache:', error);
    throw error;
  }
}

/**
 * Get current like count from sheet
 */
async function getCurrentLikeCount(itemId: string, itemType: 'competition' | 'business-opportunity'): Promise<number> {
  try {
    await updateSheetCache();

    const isCompetition = itemType === 'competition';
    const cache = isCompetition ? sheetCache.competitions : sheetCache.opportunities;
    const sheetName = isCompetition ? COMPETITIONS_SHEET_NAME : OPPORTUNITIES_SHEET_NAME;

    const rowNumber = cache.get(itemId);
    if (!rowNumber) {
      console.warn(`Item not found in cache: ${itemId}`);
      return 0;
    }

    const sheets = getGoogleSheetsClient();

    // Assume likes are in column B (you may need to adjust this)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!B${rowNumber}:B${rowNumber}`,
    });

    const values = response.data.values;
    if (values && values[0] && values[0][0]) {
      const likeCount = parseInt(values[0][0], 10);
      return isNaN(likeCount) ? 0 : likeCount;
    }

    return 0;
  } catch (error) {
    console.error('Failed to get current like count:', error);
    return 0;
  }
}

/**
 * Update like count in Google Sheet
 */
async function updateLikeCount(itemId: string, itemType: 'competition' | 'business-opportunity', newCount: number): Promise<boolean> {
  try {
    await updateSheetCache();

    const isCompetition = itemType === 'competition';
    const cache = isCompetition ? sheetCache.competitions : sheetCache.opportunities;
    const sheetName = isCompetition ? COMPETITIONS_SHEET_NAME : OPPORTUNITIES_SHEET_NAME;

    const rowNumber = cache.get(itemId);
    if (!rowNumber) {
      console.warn(`Cannot update likes: Item not found in cache: ${itemId}`);
      return false;
    }

    const sheets = getGoogleSheetsClient();

    // Update likes in column B (you may need to adjust this)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!B${rowNumber}:B${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount.toString()]]
      }
    });

    console.log(`✅ Updated ${itemType} ${itemId} likes to ${newCount} in row ${rowNumber}`);
    return true;

  } catch (error) {
    console.error('Failed to update like count in sheet:', error);
    return false;
  }
}

/**
 * Increment like count in Google Sheet
 */
export async function incrementLikeCount(itemId: string, itemType: 'competition' | 'business-opportunity'): Promise<number> {
  try {
    const currentCount = await getCurrentLikeCount(itemId, itemType);
    const newCount = currentCount + 1;

    const success = await updateLikeCount(itemId, itemType, newCount);
    if (success) {
      return newCount;
    }

    return currentCount; // Return unchanged count if update failed
  } catch (error) {
    console.error('Failed to increment like count:', error);
    return 0;
  }
}

/**
 * Decrement like count in Google Sheet
 */
export async function decrementLikeCount(itemId: string, itemType: 'competition' | 'business-opportunity'): Promise<number> {
  try {
    const currentCount = await getCurrentLikeCount(itemId, itemType);
    const newCount = Math.max(0, currentCount - 1); // Don't go below 0

    const success = await updateLikeCount(itemId, itemType, newCount);
    if (success) {
      return newCount;
    }

    return currentCount; // Return unchanged count if update failed
  } catch (error) {
    console.error('Failed to decrement like count:', error);
    return 0;
  }
}

/**
 * Get like count for an item (for reading without updating)
 */
export async function getLikeCount(itemId: string, itemType: 'competition' | 'business-opportunity'): Promise<number> {
  try {
    return await getCurrentLikeCount(itemId, itemType);
  } catch (error) {
    console.error('Failed to get like count:', error);
    return 0;
  }
}

/**
 * Initialize or add likes column to sheet if it doesn't exist
 */
export async function ensureLikesColumn(sheetName: string): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();

    // Get sheet metadata to check if likes column exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!1:1`, // Header row
    });

    const headers = response.data.values?.[0] || [];

    // Check if "Likes" column already exists
    if (headers.includes('Likes')) {
      console.log(`✅ Likes column already exists in ${sheetName}`);
      return true;
    }

    // Add "Likes" header to column B
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!B1:B1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Likes']]
      }
    });

    // Initialize all existing rows with 0 likes
    const allDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:A`, // All names
    });

    const allRows = allDataResponse.data.values || [];
    if (allRows.length > 1) { // More than just header
      const likesData = Array.from({ length: allRows.length - 1 }, () => ['0']);

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!B2:B${allRows.length}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: likesData
        }
      });
    }

    console.log(`✅ Added Likes column to ${sheetName}`);

    // Clear cache to force refresh
    sheetCache.lastUpdated = 0;

    return true;
  } catch (error) {
    console.error(`Failed to ensure likes column in ${sheetName}:`, error);
    return false;
  }
}

/**
 * Initialize likes columns in both sheets
 */
export async function initializeLikesColumns(): Promise<void> {
  try {
    console.log('🚀 Initializing likes columns in Google Sheets...');

    await ensureLikesColumn(COMPETITIONS_SHEET_NAME);
    await ensureLikesColumn(OPPORTUNITIES_SHEET_NAME);

    console.log('✅ Likes columns initialized successfully');
  } catch (error) {
    console.error('Failed to initialize likes columns:', error);
    throw error;
  }
}

/**
 * Test Google Sheets API connection
 */
export async function testGoogleSheetsConnection(): Promise<boolean> {
  try {
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log(`✅ Connected to Google Sheet: ${response.data.properties?.title}`);
    return true;
  } catch (error) {
    console.error('❌ Google Sheets connection test failed:', error);
    return false;
  }
}

/**
 * Check if Google Sheets API is properly configured
 */
export function isGoogleSheetsWriteEnabled(): boolean {
  return !!(process.env.GOOGLE_SHEETS_CREDENTIALS || process.env.GOOGLE_SHEETS_API_KEY);
}
