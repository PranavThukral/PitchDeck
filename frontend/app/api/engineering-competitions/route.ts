import { NextResponse } from "next/server";
import { getEngineeringCompetitionsSortedByDeadline } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const competitions = await getEngineeringCompetitionsSortedByDeadline();
    return NextResponse.json(competitions, { status: 200 });
  } catch (error) {
    console.error("Get engineering competitions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch engineering competitions from Google Sheets" },
      { status: 500 },
    );
  }
}
