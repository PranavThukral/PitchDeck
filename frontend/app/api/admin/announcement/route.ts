import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "@/lib/config/database";
import { verifyAuth } from "@/lib/middleware/auth";
import SiteAnnouncement from "@/lib/models/SiteAnnouncement";

const DEFAULT_VALUES = {
  isEnabled: false,
  title: "Coming from our socials?",
  message:
    "Tap below to sign up and get the newest competitions and programs before anyone else.",
  imageUrl: "/images/TPD.png",
  primaryCtaLabel: "Sign up",
  primaryCtaUrl: "/auth/general/signup",
  secondaryCtaLabel: "Explore other opportunities",
  secondaryCtaUrl: "/business-opportunities",
};

async function ensureDatabase() {
  if (!isMongoDBConfigured()) {
    throw new Error("Database not available - MongoDB not configured");
  }
  await connectToDatabase();
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ensureDatabase();

    let announcement = await SiteAnnouncement.findOne();
    if (!announcement) {
      announcement = await SiteAnnouncement.create({});
    }

    const data = announcement.toObject();

    return NextResponse.json(
      {
        success: true,
        data: {
          isEnabled: data.isEnabled,
          title: data.title,
          message: data.message,
          imageUrl: data.imageUrl,
          primaryCtaLabel: data.primaryCtaLabel,
          primaryCtaUrl: data.primaryCtaUrl,
          secondaryCtaLabel: data.secondaryCtaLabel,
          secondaryCtaUrl: data.secondaryCtaUrl,
          updatedAt: data.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin announcement fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load announcement",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || authResult.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await ensureDatabase();

    const payload = await request.json();

    const update = {
      isEnabled:
        typeof payload.isEnabled === "boolean"
          ? payload.isEnabled
          : DEFAULT_VALUES.isEnabled,
      title:
        typeof payload.title === "string" && payload.title.trim().length > 0
          ? payload.title.trim()
          : DEFAULT_VALUES.title,
      message:
        typeof payload.message === "string" && payload.message.trim().length > 0
          ? payload.message.trim()
          : DEFAULT_VALUES.message,
      imageUrl:
        typeof payload.imageUrl === "string" && payload.imageUrl.trim().length > 0
          ? payload.imageUrl.trim()
          : DEFAULT_VALUES.imageUrl,
      primaryCtaLabel: DEFAULT_VALUES.primaryCtaLabel,
      primaryCtaUrl:
        typeof payload.primaryCtaUrl === "string" &&
        payload.primaryCtaUrl.trim().length > 0
          ? payload.primaryCtaUrl.trim()
          : DEFAULT_VALUES.primaryCtaUrl,
      secondaryCtaLabel: DEFAULT_VALUES.secondaryCtaLabel,
      secondaryCtaUrl: DEFAULT_VALUES.secondaryCtaUrl,
    };

    const announcement = await SiteAnnouncement.findOneAndUpdate(
      {},
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Announcement updated successfully",
        data: announcement.toObject(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin announcement update error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update announcement",
      },
      { status: 500 },
    );
  }
}
