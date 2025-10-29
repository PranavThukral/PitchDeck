import { NextRequest, NextResponse } from "next/server";
import { isMongoDBConfigured } from "../../../../lib/config/database";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    mongoConfigured: isMongoDBConfigured(),
    mongoUri: process.env.MONGO_URI ? "SET" : "NOT_SET",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
