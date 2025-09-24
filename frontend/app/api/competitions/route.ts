import { NextResponse } from "next/server";
import { getCompetitionsSortedByDeadline } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const competitions = await getCompetitionsSortedByDeadline();
    return NextResponse.json(competitions, { status: 200 });
  } catch (error) {
    console.error("Get competitions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch competitions from Google Sheets" },
      { status: 500 },
    );
  }
}
