import { NextRequest, NextResponse } from "next/server";
import { fetchCompetitionsFromSheets } from "../../../../lib/services/google-sheets";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const competitions = await fetchCompetitionsFromSheets();
    const { id } = await params;
    const competition = competitions.find((comp) => comp.id === id);

    if (!competition) {
      return NextResponse.json(
        { message: "Competition not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(competition, { status: 200 });
  } catch (error) {
    console.error("Get competition error:", error);
    return NextResponse.json(
      { message: "Failed to fetch competition from Google Sheets" },
      { status: 500 },
    );
  }
}
