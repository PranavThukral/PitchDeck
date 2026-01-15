import { NextResponse } from "next/server";
import { getMedicineCompetitionsSortedByDeadline } from "../../../lib/services/google-sheets";

export async function GET() {
  try {
    const competitions = await getMedicineCompetitionsSortedByDeadline();
    return NextResponse.json(competitions, { status: 200 });
  } catch (error) {
    console.error("Get medicine competitions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch medicine competitions from Google Sheets" },
      { status: 500 },
    );
  }
}
