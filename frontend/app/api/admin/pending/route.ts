import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import Competition from "../../../../lib/models/Competition";
import BusinessOpportunity from "../../../../lib/models/BusinessOpportunity";
import { verifyAuth } from "../../../../lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        {
          message: "Database not available - MongoDB not configured",
        },
        { status: 503 },
      );
    }

    // Verify user is authenticated and is an admin
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // Get pending competitions
    const pendingCompetitions = await Competition.find({
      status: "pending",
      approved: false,
    })
      .sort({ submittedAt: -1 })
      .populate("organizerId", "firstName lastName email organization");

    // Get pending business opportunities
    const pendingBusinessOpportunities = await BusinessOpportunity.find({
      status: "pending",
      approved: false,
    })
      .sort({ submittedAt: -1 })
      .populate("organizerId", "firstName lastName email organization");

    // Get rejected items for reference
    const rejectedCompetitions = await Competition.find({
      status: "rejected",
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("organizerId", "firstName lastName email organization");

    const rejectedBusinessOpportunities = await BusinessOpportunity.find({
      status: "rejected",
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("organizerId", "firstName lastName email organization");

    return NextResponse.json(
      {
        message: "Pending items retrieved successfully",
        data: {
          pending: {
            competitions: pendingCompetitions,
            businessOpportunities: pendingBusinessOpportunities,
          },
          rejected: {
            competitions: rejectedCompetitions,
            businessOpportunities: rejectedBusinessOpportunities,
          },
          stats: {
            totalPendingCompetitions: pendingCompetitions.length,
            totalPendingBusinessOpportunities:
              pendingBusinessOpportunities.length,
            totalPending:
              pendingCompetitions.length + pendingBusinessOpportunities.length,
          },
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin pending items error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
