import { NextResponse } from "next/server";
import { fetchCompetitionsFromSheets } from "../../../../lib/services/google-sheets";

export async function GET() {
  try {
    const competitions = await fetchCompetitionsFromSheets();

    const stats = {
      total: competitions.length,
      open: competitions.filter((c) => c.status === "open").length,
      closingSoon: competitions.filter((c) => c.status === "closing-soon")
        .length,
      closed: competitions.filter((c) => c.status === "closed").length,
      free: competitions.filter((c) => c.cost.toLowerCase().includes("free"))
        .length,
      virtual: competitions.filter((c) =>
        c.location.toLowerCase().includes("virtual"),
      ).length,
      inPerson: competitions.filter((c) =>
        c.location.toLowerCase().includes("in-person"),
      ).length,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Get competition stats error:", error);
    return NextResponse.json(
      { message: "Failed to fetch competition stats from Google Sheets" },
      { status: 500 },
    );
  }
}
