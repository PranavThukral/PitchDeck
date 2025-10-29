import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "../../../../lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        message: "Logged out successfully",
        success: true,
      },
      { status: 200 },
    );

    // Clear all auth cookies
    clearAuthCookie(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET request for logout as well
  return POST(request);
}
