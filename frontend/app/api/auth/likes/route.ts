import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import User from "../../../../lib/models/User";
import Competition from "../../../../lib/models/Competition";
import BusinessOpportunity from "../../../../lib/models/BusinessOpportunity";
import { verifyAuth } from "../../../../lib/middleware/auth";
import {
  incrementLikeCount,
  decrementLikeCount,
  getLikeCount,
  isGoogleSheetsWriteEnabled,
} from "../../../../lib/services/google-sheets-api";

interface LikeData {
  itemId: string;
  itemType: "competition" | "business-opportunity";
}

// GET: Get user's liked items
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

    // Verify user is authenticated
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "general") {
      return NextResponse.json(
        { message: "Only general users can like items" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // Get user with liked items
    const user = await User.findOne({
      email: authResult.user.email,
      userType: "general",
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Liked items retrieved successfully",
        data: {
          likedItems: user.likedItems || [],
          total: user.likedItems?.length || 0,
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get liked items error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}

// POST: Add like to item
export async function POST(request: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        {
          message: "Database not available - MongoDB not configured",
        },
        { status: 503 },
      );
    }

    // Verify user is authenticated
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "general") {
      return NextResponse.json(
        { message: "Only general users can like items" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body: LikeData = await request.json();
    const { itemId, itemType } = body;

    // Validate input
    if (!itemId || !itemType) {
      return NextResponse.json(
        { message: "Item ID and type are required" },
        { status: 400 },
      );
    }

    if (!["competition", "business-opportunity"].includes(itemType)) {
      return NextResponse.json(
        { message: "Invalid item type" },
        { status: 400 },
      );
    }

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
      } else {
        item = await BusinessOpportunity.findOne({
          _id: itemId,
          approved: true,
          status: "live",
        });
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
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if already liked (handle both MongoDB ObjectIds and string IDs)
    const isAlreadyLiked = user.likedItems?.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (likedId: any) => likedId.toString() === itemId,
    );

    if (isAlreadyLiked) {
      return NextResponse.json(
        { message: `${itemType} is already liked` },
        { status: 400 },
      );
    }

    // Add to user's liked items (MongoDB will handle both ObjectId and string storage)
    if (!user.likedItems) {
      user.likedItems = [];
    }
    user.likedItems.push(itemId as any);
    await user.save();

    // Increment like count on the item
    let itemLikeCount = 0;
    if (isMongoId) {
      // MongoDB items - update in database
      if (itemType === "competition") {
        const updatedItem = await Competition.findByIdAndUpdate(
          itemId,
          { $inc: { likes: 1 } },
          { new: true },
        );
        itemLikeCount = updatedItem?.likes || 0;
      } else {
        const updatedItem = await BusinessOpportunity.findByIdAndUpdate(
          itemId,
          { $inc: { likes: 1 } },
          { new: true },
        );
        itemLikeCount = updatedItem?.likes || 0;
      }
    } else {
      // Google Sheets items - update in Google Sheets if API is enabled
      if (isGoogleSheetsWriteEnabled()) {
        try {
          console.log("🔍 Updating Google Sheets like count for:", itemId);
          itemLikeCount = await incrementLikeCount(itemId, itemType);
          console.log("✅ Updated Google Sheets like count to:", itemLikeCount);
        } catch (error) {
          console.error("❌ Failed to update Google Sheets:", error);
          // Fall back to getting current count
          itemLikeCount = await getLikeCount(itemId, itemType);
        }
      } else {
        console.warn(
          "⚠️ Google Sheets write not enabled, using read-only count",
        );
        itemLikeCount = await getLikeCount(itemId, itemType);
      }
    }

    return NextResponse.json(
      {
        message: `${itemType} liked successfully`,
        data: {
          itemId,
          itemType,
          totalUserLikes: user.likedItems.length,
          itemLikeCount,
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Add like error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}

// DELETE: Remove like from item
export async function DELETE(request: NextRequest) {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json(
        {
          message: "Database not available - MongoDB not configured",
        },
        { status: 503 },
      );
    }

    // Verify user is authenticated
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (authResult.user.userType !== "general") {
      return NextResponse.json(
        { message: "Only general users can like items" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body: LikeData = await request.json();
    const { itemId, itemType } = body;

    // Validate input
    if (!itemId || !itemType) {
      return NextResponse.json(
        { message: "Item ID and type are required" },
        { status: 400 },
      );
    }

    if (!["competition", "business-opportunity"].includes(itemType)) {
      return NextResponse.json(
        { message: "Invalid item type" },
        { status: 400 },
      );
    }

    // Get user
    const user = await User.findOne({
      email: authResult.user.email,
      userType: "general",
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if liked (handle both MongoDB ObjectIds and string IDs)
    const likedIndex = user.likedItems?.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (likedId: any) => likedId.toString() === itemId,
    );

    if (likedIndex === -1 || likedIndex === undefined) {
      return NextResponse.json(
        { message: `${itemType} is not liked` },
        { status: 400 },
      );
    }

    // Remove from user's liked items
    if (user.likedItems) {
      user.likedItems.splice(likedIndex, 1);
      await user.save();
    }

    // Check if itemId is a MongoDB ObjectId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);

    // Decrement like count on the item
    let itemLikeCount = 0;
    if (isMongoId) {
      // MongoDB items - update in database
      if (itemType === "competition") {
        const updatedItem = await Competition.findByIdAndUpdate(
          itemId,
          { $inc: { likes: -1 } },
          { new: true },
        );
        if (updatedItem && updatedItem.likes < 0) {
          await Competition.findByIdAndUpdate(itemId, { likes: 0 });
          itemLikeCount = 0;
        } else {
          itemLikeCount = updatedItem?.likes || 0;
        }
      } else {
        const updatedItem = await BusinessOpportunity.findByIdAndUpdate(
          itemId,
          { $inc: { likes: -1 } },
          { new: true },
        );
        if (updatedItem && updatedItem.likes < 0) {
          await BusinessOpportunity.findByIdAndUpdate(itemId, { likes: 0 });
          itemLikeCount = 0;
        } else {
          itemLikeCount = updatedItem?.likes || 0;
        }
      }
    } else {
      // Google Sheets items - update in Google Sheets if API is enabled
      if (isGoogleSheetsWriteEnabled()) {
        try {
          console.log("🔍 Decrementing Google Sheets like count for:", itemId);
          itemLikeCount = await decrementLikeCount(itemId, itemType);
          console.log("✅ Updated Google Sheets like count to:", itemLikeCount);
        } catch (error) {
          console.error("❌ Failed to update Google Sheets:", error);
          // Fall back to getting current count
          itemLikeCount = await getLikeCount(itemId, itemType);
        }
      } else {
        console.warn(
          "⚠️ Google Sheets write not enabled, using read-only count",
        );
        itemLikeCount = await getLikeCount(itemId, itemType);
      }
    }

    return NextResponse.json(
      {
        message: `${itemType} unliked successfully`,
        data: {
          itemId,
          itemType,
          totalUserLikes: user.likedItems?.length || 0,
          itemLikeCount,
        },
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Remove like error:", error);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 },
    );
  }
}
