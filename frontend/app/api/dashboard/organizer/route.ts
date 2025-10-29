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

    // Verify user is authenticated and is an organizer
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "organizer") {
      return NextResponse.json(
        { message: "Organizer access required" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // Get organizer's competitions by email instead of ID
    const myCompetitions = await Competition.find({
      organizerEmail: authResult.user.email,
    }).sort({ createdAt: -1 });

    // Get organizer's business opportunities by email instead of ID
    const myBusinessOpportunities = await BusinessOpportunity.find({
      companyEmail: authResult.user.email,
    }).sort({ createdAt: -1 });

    // Get statistics
    const competitionStats = await Competition.aggregate([
      {
        $match: {
          organizerEmail: authResult.user.email,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const businessOpportunityStats = await BusinessOpportunity.aggregate([
      {
        $match: {
          companyEmail: authResult.user.email,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get pending items count
    const pendingCompetitions = myCompetitions.filter(
      (c) => c.status === "pending",
    ).length;
    const pendingBusinessOpportunities = myBusinessOpportunities.filter(
      (bo) => bo.status === "pending",
    ).length;
    const approvedCompetitions = myCompetitions.filter(
      (c) => c.status === "live",
    ).length;
    const approvedBusinessOpportunities = myBusinessOpportunities.filter(
      (bo) => bo.status === "live",
    ).length;
    const rejectedCompetitions = myCompetitions.filter(
      (c) => c.status === "rejected",
    ).length;
    const rejectedBusinessOpportunities = myBusinessOpportunities.filter(
      (bo) => bo.status === "rejected",
    ).length;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompetitions = await Competition.find({
      organizerEmail: authResult.user.email,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: -1 });

    const recentBusinessOpportunities = await BusinessOpportunity.find({
      companyEmail: authResult.user.email,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Organizer dashboard data retrieved successfully",
        data: {
          mySubmissions: {
            competitions: myCompetitions,
            businessOpportunities: myBusinessOpportunities,
          },
          recentActivity: {
            competitions: recentCompetitions,
            businessOpportunities: recentBusinessOpportunities,
          },
          stats: {
            competitions: {
              total: myCompetitions.length,
              pending: pendingCompetitions,
              approved: approvedCompetitions,
              rejected: rejectedCompetitions,
              statusBreakdown: competitionStats,
            },
            businessOpportunities: {
              total: myBusinessOpportunities.length,
              pending: pendingBusinessOpportunities,
              approved: approvedBusinessOpportunities,
              rejected: rejectedBusinessOpportunities,
              statusBreakdown: businessOpportunityStats,
            },
            totalSubmissions:
              myCompetitions.length + myBusinessOpportunities.length,
            totalPending: pendingCompetitions + pendingBusinessOpportunities,
            totalApproved: approvedCompetitions + approvedBusinessOpportunities,
            totalRejected: rejectedCompetitions + rejectedBusinessOpportunities,
          },
          user: {
            firstName: authResult.user.firstName,
            lastName: authResult.user.lastName,
            organization: authResult.user.organization,
            position: authResult.user.position,
          },
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Organizer dashboard error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
