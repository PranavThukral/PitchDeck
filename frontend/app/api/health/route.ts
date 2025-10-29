import { NextResponse } from "next/server";
import { isMongoDBConfigured } from "../../../lib/config/database";

export async function GET() {
  try {
    const mongoConfigured = isMongoDBConfigured();

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          api: "running",
          database: mongoConfigured ? "configured" : "not configured",
        },
        message: "Tiered Login System API is running",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        services: {
          api: "error",
          database: "unknown",
        },
        message: "Health check failed",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
