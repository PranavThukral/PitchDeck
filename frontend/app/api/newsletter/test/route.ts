import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Newsletter test endpoint called");

  try {
    // Check for MailerLite API key
    const apiKey = process.env.MAILERLITE_API_KEY;

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiKeyConfigured: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : "Not set",
      headers: {
        host: request.headers.get("host"),
        userAgent: request.headers.get("user-agent"),
      },
    };

    console.log("Test endpoint response:", response);

    return NextResponse.json({
      success: true,
      message: "Newsletter API test endpoint working",
      data: response,
    });
  } catch (error) {
    console.error("Test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("Newsletter test POST endpoint called");

  try {
    const body = await request.json();
    console.log("Test POST body:", body);

    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "MAILERLITE_API_KEY not configured",
        suggestion: "Add MAILERLITE_API_KEY to your .env.local file",
      });
    }

    // Test MailerLite API connectivity without creating a subscriber
    try {
      const testResponse = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        },
      });

      return NextResponse.json({
        success: true,
        message: "MailerLite API connection test",
        apiConnectivity: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          accessible: testResponse.status === 200 || testResponse.status === 422,
        },
        testData: body,
      });
    } catch (apiError) {
      console.error("MailerLite API test error:", apiError);

      return NextResponse.json({
        success: false,
        error: "Failed to connect to MailerLite API",
        details: apiError instanceof Error ? apiError.message : "Network error",
      });
    }
  } catch (error) {
    console.error("Test POST endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Test POST endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
