import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import Competition, { ICompetition } from "../../../../lib/models/Competition";
import BusinessOpportunity, {
  IBusinessOpportunity,
} from "../../../../lib/models/BusinessOpportunity";
import User, { IUser } from "../../../../lib/models/User";
import { verifyAuth, type AuthUser } from "../../../../lib/middleware/auth";
import { getCompetitionsSortedByDeadline } from "../../../../lib/services/google-sheets";
import { getBusinessOpportunitiesSortedByDeadline } from "../../../../lib/services/google-sheets";

export async function GET(request: NextRequest) {
  try {
    let authUser: AuthUser;
    let useDatabase = false;

    if (isMongoDBConfigured()) {
      const authResult = await verifyAuth(request);
      if (!authResult.success || !authResult.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      if (authResult.user.userType !== "general") {
        return NextResponse.json(
          { message: "General user access required" },
          { status: 403 },
        );
      }
      authUser = authResult.user;
      useDatabase = true;
    } else {
      // Without a database, serve the public Google Sheets data to a local user.
      authUser = {
        id: "local",
        email: "local@user.com",
        firstName: "Local",
        lastName: "User",
        school: "N/A",
        grade: "N/A",
        userType: "general",
        approved: true,
      };
    }

    if (useDatabase) {
      await connectToDatabase();
    }

    // Get data from both sources
    let sheetsCompetitions: Array<{ [key: string]: any }> = [];
    let sheetsBusinessOpportunities: Array<{ [key: string]: any }> = [];

    try {
      // Get competitions and business opportunities from Google Sheets
      sheetsCompetitions = (await getCompetitionsSortedByDeadline()) || [];
      sheetsBusinessOpportunities =
        (await getBusinessOpportunitiesSortedByDeadline()) || [];
    } catch (error) {
      console.warn("Failed to fetch Google Sheets data:", error);
      // Continue without Google Sheets data
    }

    let dbCompetitions: ICompetition[] = [];
    let dbBusinessOpportunities: IBusinessOpportunity[] = [];

    if (useDatabase) {
      // Get approved and live competitions from database
      dbCompetitions = await Competition.find({
        status: "live",
        approved: true,
        deadline: { $gte: new Date() }, // Only upcoming competitions
      })
        .sort({ deadline: 1 })
        .limit(20);

      // Get approved and live business opportunities from database
      dbBusinessOpportunities = await BusinessOpportunity.find({
        status: "live",
        approved: true,
        deadline: { $gte: new Date() }, // Only upcoming opportunities
      })
        .sort({ deadline: 1 })
        .limit(20);
    }

    // Convert database items to match the expected format
    const formattedDbCompetitions = dbCompetitions.map((comp) => ({
      id: (comp._id as any).toString(),
      _id: (comp._id as any).toString(),
      title: comp.title,
      organizer: comp.organizer,
      logo: comp.logo,
      gradeTags: comp.gradeEligibility
        ? comp.gradeEligibility
            .split(",")
            .map((g: string) => g.trim().toLowerCase())
        : [],
      deadline: comp.deadline.toISOString(),
      prize: comp.prize,
      status: comp.status,
      description: comp.description,
      applicationType: comp.applicationType,
      applyUrl: comp.applyUrl,
      frequency: comp.frequency,
      dates: comp.dates,
      location: comp.location,
      cost: comp.cost,
      category: comp.category,
      maxParticipants: comp.maxParticipants,
      requirements: comp.requirements,
      contactEmail: comp.contactEmail,
      contactPhone: comp.contactPhone,
      website: comp.website,
      tags: comp.tags,
      likes: comp.likes || 0,
    }));

    const formattedDbBusinessOpportunities = dbBusinessOpportunities.map(
      (opp) => ({
        id: (opp._id as any).toString(),
        _id: (opp._id as any).toString(),
        title: opp.title,
        company: opp.company,
        organizer: opp.company,
        logo: opp.logo,
        gradeTags: (opp as any).gradeEligibility
          ? (opp as any).gradeEligibility
              .split(",")
              .map((g: string) => g.trim().toLowerCase())
          : [],
        deadline: opp.deadline.toISOString(),
        startDate: opp.deadline.toISOString(),
        endDate: opp.deadline.toISOString(),
        type: opp.type,
        category: opp.type,
        format: opp.remote ? "Remote" : "On-site",
        status: opp.status,
        cost: opp.compensation || "Not specified",
        costNumeric: 0,
        duration: opp.duration || "Not specified",
        timeCommitment: opp.duration || "Not specified",
        opportunityType: [opp.type],
        applicationType: "individual",
        description: opp.description,
        applyUrl: opp.applyUrl,
        location: opp.location,
        compensation: opp.compensation,
        requirements: opp.requirements,
        contactEmail: opp.contactEmail,
        website: opp.website,
        tags: opp.tags,
        likes: opp.likes || 0,
      }),
    );

    // Combine Google Sheets data with database data
    const allCompetitions = [...sheetsCompetitions, ...formattedDbCompetitions];
    const allBusinessOpportunities = [
      ...sheetsBusinessOpportunities,
      ...formattedDbBusinessOpportunities,
    ];

    // Sort combined data by deadline
    allCompetitions.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );
    allBusinessOpportunities.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    );

    // Get user's favourites and liked items (only if database is available)
    let user: IUser | null = null;
    if (useDatabase) {
      user = await User.findOne({
        email: authUser.email,
        userType: "general",
      }).populate([
        {
          path: "favourites",
          match: { approved: true, status: "live" },
        },
      ]);
    }

    // Get featured items (most recent from combined data)
    const featuredCompetitions = allCompetitions.slice(0, 6);
    const featuredBusinessOpportunities = allBusinessOpportunities.slice(0, 6);

    // Get categories from database competitions (only if database is available)
    let competitionCategories: Array<{ _id: string; count: number }> = [];
    let opportunityTypes: Array<{ _id: string; count: number }> = [];

    if (useDatabase) {
      competitionCategories = await Competition.aggregate([
        {
          $match: {
            status: "live",
            approved: true,
            deadline: { $gte: new Date() },
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);

      opportunityTypes = await BusinessOpportunity.aggregate([
        {
          $match: {
            status: "live",
            approved: true,
            deadline: { $gte: new Date() },
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);
    }

    return NextResponse.json(
      {
        message: "Dashboard data retrieved successfully",
        data: {
          competitions: allCompetitions,
          businessOpportunities: allBusinessOpportunities,
          featured: {
            competitions: featuredCompetitions,
            businessOpportunities: featuredBusinessOpportunities,
          },
          favourites: user?.favourites || [],
          likedItems: user?.likedItems || [],
          stats: {
            totalCompetitions: allCompetitions.length,
            totalBusinessOpportunities: allBusinessOpportunities.length,
            totalFavourites: user?.favourites?.length || 0,
            totalLikes: user?.likedItems?.length || 0,
            categories: competitionCategories,
            opportunityTypes,
          },
          user: {
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            school: authUser.school,
            grade: authUser.grade,
          },
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("General dashboard error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
