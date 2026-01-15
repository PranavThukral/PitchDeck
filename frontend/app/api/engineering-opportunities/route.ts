import { NextResponse } from "next/server";
import { getEngineeringOpportunitiesSorted } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const opportunities = await getEngineeringOpportunitiesSorted();
    return NextResponse.json(opportunities, { status: 200 });
  } catch (error) {
    console.error("Get engineering opportunities error:", error);
    return NextResponse.json(
      { message: "Failed to fetch engineering opportunities from Google Sheets" },
      { status: 500 },
    );
  }
}
