import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import User from "../../../../lib/models/User";
import Competition from "../../../../lib/models/Competition";
import BusinessOpportunity from "../../../../lib/models/BusinessOpportunity";
import {
  validateFavourites,
  withValidation,
} from "../../../../lib/middleware/validation";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { FavouritesData } from "../../../../lib/types/api";

// GET: Retrieve user's favourites
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

    // Verify user is authenticated and is a general user
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "general") {
      return NextResponse.json(
        { message: "Only general users can have favourites" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // Get user with populated favourites
    const user = await User.findOne({
      email: authResult.user.email,
      userType: "general",
    }).populate([
      {
        path: "favourites",
        match: { approved: true, status: "live" },
      },
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Separate favourites by type
    const competitions = [];
    const businessOpportunities = [];

    for (const favourite of user.favourites) {
      // Check if it's a competition or business opportunity
      const competition = await Competition.findById(favourite._id);
      if (competition) {
        competitions.push(competition);
      } else {
        const businessOpportunity = await BusinessOpportunity.findById(
          favourite._id,
        );
        if (businessOpportunity) {
          businessOpportunities.push(businessOpportunity);
        }
      }
    }

    return NextResponse.json(
      {
        message: "Favourites retrieved successfully",
        data: {
          competitions,
          businessOpportunities,
          total: competitions.length + businessOpportunities.length,
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get favourites error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}

// POST: Add item to favourites
export async function POST(request: NextRequest) {
  return withValidation<FavouritesData>(
    request,
    validateFavourites,
    async (req, data) => {
      try {
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Database not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        // Verify user is authenticated and is a general user
        const authResult = await verifyAuth(req);
        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }

        if (authResult.user.userType !== "general") {
          return NextResponse.json(
            { message: "Only general users can have favourites" },
            { status: 403 },
          );
        }

        await connectToDatabase();

        const { itemId, itemType } = data;

        // Check if itemId is a MongoDB ObjectId (24 char hex) or Google Sheets ID
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);

        // For MongoDB items, verify they exist and are approved
        if (isMongoId) {
          let item;
          if (itemType === "competition") {
            item = await Competition.findOne({
              _id: itemId,
              approved: true,
              status: "live",
            });
          } else if (itemType === "business-opportunity") {
            item = await BusinessOpportunity.findOne({
              _id: itemId,
              approved: true,
              status: "live",
            });
          } else {
            return NextResponse.json(
              { message: "Invalid item type" },
              { status: 400 },
            );
          }

          if (!item) {
            return NextResponse.json(
              { message: `${itemType} not found or not available` },
              { status: 404 },
            );
          }
        } else {
          // For Google Sheets items, just validate the itemType
          if (!["competition", "business-opportunity"].includes(itemType)) {
            return NextResponse.json(
              { message: "Invalid item type" },
              { status: 400 },
            );
          }
        }

        // Get user
        const user = await User.findOne({
          email: authResult.user.email,
          userType: "general",
        });
        if (!user) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 },
          );
        }

        // Check if already in favourites (handle both MongoDB ObjectIds and string IDs)
        const isAlreadyFavourite = user.favourites.some(
          (fav) => fav.toString() === itemId,
        );

        if (isAlreadyFavourite) {
          return NextResponse.json(
            { message: `${itemType} is already in favourites` },
            { status: 400 },
          );
        }

        // Add to favourites (MongoDB will handle both ObjectId and string storage)
        user.favourites.push(itemId as any);
        await user.save();

        return NextResponse.json(
          {
            message: `${itemType} added to favourites successfully`,
            data: {
              itemId,
              itemType,
              totalFavourites: user.favourites.length,
            },
            success: true,
          },
          { status: 200 },
        );
      } catch (error) {
        console.error("Add to favourites error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}

// DELETE: Remove item from favourites
export async function DELETE(request: NextRequest) {
  return withValidation<FavouritesData>(
    request,
    validateFavourites,
    async (req, data) => {
      try {
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Database not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        // Verify user is authenticated and is a general user
        const authResult = await verifyAuth(req);
        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }

        if (authResult.user.userType !== "general") {
          return NextResponse.json(
            { message: "Only general users can have favourites" },
            { status: 403 },
          );
        }

        await connectToDatabase();

        const { itemId, itemType } = data;

        // Get user
        const user = await User.findOne({
          email: authResult.user.email,
          userType: "general",
        });
        if (!user) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 },
          );
        }

        // Check if in favourites (handle both MongoDB ObjectIds and string IDs)
        const favouriteIndex = user.favourites.findIndex(
          (fav) => fav.toString() === itemId,
        );

        if (favouriteIndex === -1) {
          return NextResponse.json(
            { message: `${itemType} is not in favourites` },
            { status: 400 },
          );
        }

        // Remove from favourites
        user.favourites.splice(favouriteIndex, 1);
        await user.save();

        return NextResponse.json(
          {
            message: `${itemType} removed from favourites successfully`,
            data: {
              itemId,
              itemType,
              totalFavourites: user.favourites.length,
            },
            success: true,
          },
          { status: 200 },
        );
      } catch (error) {
        console.error("Remove from favourites error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
