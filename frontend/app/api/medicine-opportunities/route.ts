import { NextResponse } from "next/server";
import { getMedicineOpportunitiesSorted } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const opportunities = await getMedicineOpportunitiesSorted();
    return NextResponse.json(opportunities, { status: 200 });
  } catch (error) {
    console.error("Get medicine opportunities error:", error);
    return NextResponse.json(
      { message: "Failed to fetch medicine opportunities from Google Sheets" },
      { status: 500 },
    );
  }
}
