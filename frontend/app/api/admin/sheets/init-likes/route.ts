import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../../lib/middleware/auth";
import {
  initializeLikesColumns,
  testGoogleSheetsConnection,
  isGoogleSheetsWriteEnabled,
} from "../../../../../lib/services/google-sheets-api";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    // Check if Google Sheets API is configured
    if (!isGoogleSheetsWriteEnabled()) {
      return NextResponse.json(
        {
          message: "Google Sheets API not configured",
          error: "GOOGLE_SHEETS_CREDENTIALS or GOOGLE_SHEETS_API_KEY environment variable not found",
          success: false,
        },
        { status: 503 },
      );
    }

    console.log("🔧 Admin initializing Google Sheets likes columns...");

    // Test connection first
    const connectionTest = await testGoogleSheetsConnection();
    if (!connectionTest) {
      return NextResponse.json(
        {
          message: "Failed to connect to Google Sheets API",
          error: "Connection test failed",
          success: false,
        },
        { status: 503 },
      );
    }

    // Initialize likes columns
    await initializeLikesColumns();

    console.log("✅ Google Sheets likes columns initialized successfully");

    return NextResponse.json(
      {
        message: "Google Sheets likes columns initialized successfully",
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          initializedBy: authResult.user.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to initialize Google Sheets likes columns:", error);
    return NextResponse.json(
      {
        message: "Failed to initialize likes columns",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    // Check Google Sheets API status
    const isConfigured = isGoogleSheetsWriteEnabled();
    let connectionStatus = false;

    if (isConfigured) {
      try {
        connectionStatus = await testGoogleSheetsConnection();
      } catch (error) {
        console.error("Connection test error:", error);
      }
    }

    return NextResponse.json(
      {
        message: "Google Sheets API status",
        data: {
          configured: isConfigured,
          connected: connectionStatus,
          credentialsFound: !!process.env.GOOGLE_SHEETS_CREDENTIALS,
          apiKeyFound: !!process.env.GOOGLE_SHEETS_API_KEY,
          timestamp: new Date().toISOString(),
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to check Google Sheets status:", error);
    return NextResponse.json(
      {
        message: "Failed to check Google Sheets status",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      { status: 500 },
    );
  }
}
