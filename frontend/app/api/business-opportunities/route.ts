import { NextResponse } from "next/server";
import { getBusinessOpportunitiesSorted } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const opportunities = await getBusinessOpportunitiesSorted();
    return NextResponse.json(opportunities, { status: 200 });
  } catch (error) {
    console.error("Get business opportunities error:", error);
    return NextResponse.json(
      { message: "Failed to fetch business opportunities from Google Sheets" },
      { status: 500 },
    );
  }
}
