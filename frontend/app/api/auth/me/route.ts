import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../../lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          message: "Not authenticated",
          success: false,
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        user: authResult.user,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        message: "Authentication error",
        success: false,
      },
      { status: 401 },
    );
  }
}
