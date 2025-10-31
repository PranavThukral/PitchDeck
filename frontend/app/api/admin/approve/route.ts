import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import Competition from "../../../../lib/models/Competition";
import BusinessOpportunity from "../../../../lib/models/BusinessOpportunity";
import {
  validateAdminApproval,
  withValidation,
} from "../../../../lib/middleware/validation";
import { verifyAuth } from "../../../../lib/middleware/auth";
import { AdminApprovalData } from "../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<AdminApprovalData>(
    request,
    validateAdminApproval,
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

        // Verify user is authenticated and is an admin
        const authResult = await verifyAuth(req);
        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 },
          );
        }

        if (authResult.user.userType !== "admin") {
          return NextResponse.json(
            { message: "Admin access required" },
            { status: 403 },
          );
        }

        await connectToDatabase();

        const { itemId, itemType, action, rejectionReason } = data;

        // eslint-disable-next-line prefer-const
        let item;
        let Model;

        // Determine which model to use
        if (itemType === "competition") {
          Model = Competition;
        } else if (itemType === "business-opportunity") {
          Model = BusinessOpportunity;
        } else {
          return NextResponse.json(
            { message: "Invalid item type" },
            { status: 400 },
          );
        }

        // Find the item
        item = await Model.findById(itemId);
        if (!item) {
          return NextResponse.json(
            { message: `${itemType} not found` },
            { status: 404 },
          );
        }

        // Check if item is in pending status
        if (item.status !== "pending") {
          return NextResponse.json(
            { message: `${itemType} is not pending approval` },
            { status: 400 },
          );
        }

        // Update item based on action
        if (action === "approve") {
          item.approved = true;
          item.status = "live";
          item.approvedAt = new Date();
          item.rejectionReason = undefined;
        } else if (action === "reject") {
          item.approved = false;
          item.status = "rejected";
          item.rejectionReason = rejectionReason;
          item.approvedAt = undefined;
        }

        await item.save();

        // Remove sensitive data from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { organizerId, ...itemData } = item.toObject();

        return NextResponse.json(
          {
            message: `${itemType} ${action}d successfully`,
            [itemType.replace("-", "")]: itemData,
            success: true,
          },
          { status: 200 },
        );
      } catch (error) {
        console.error("Admin approval error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
