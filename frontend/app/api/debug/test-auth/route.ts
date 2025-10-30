import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { isMongoDBConfigured } from "../../../../lib/config/database";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug: Testing authentication...");

    // Check cookies
    const cookies = {
      auth_email: request.cookies.get("auth_email")?.value,
      auth_password: request.cookies.get("auth_password")?.value,
      auth_usertype: request.cookies.get("auth_usertype")?.value,
    };

    console.log("🔍 Debug: Cookies found:", {
      hasEmail: !!cookies.auth_email,
      hasPassword: !!cookies.auth_password,
      hasUserType: !!cookies.auth_usertype,
      userType: cookies.auth_usertype,
    });

    // Check MongoDB configuration
    const mongoConfigured = isMongoDBConfigured();
    console.log("🔍 Debug: MongoDB configured:", mongoConfigured);

    // Test authentication
    const authResult = await verifyAuth(request);
    console.log("🔍 Debug: Auth result:", {
      success: authResult.success,
      userType: authResult.user?.userType,
      email: authResult.user?.email,
      message: authResult.message,
    });

    return NextResponse.json({
      debug: "Authentication Test",
      cookies,
      mongoConfigured,
      authResult: {
        success: authResult.success,
        userType: authResult.user?.userType,
        email: authResult.user?.email,
        firstName: authResult.user?.firstName,
        message: authResult.message,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("🚨 Debug: Auth test error:", error);
    return NextResponse.json(
      {
        error: "Debug test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
