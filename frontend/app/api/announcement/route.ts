import { NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "@/lib/config/database";
import SiteAnnouncement from "@/lib/models/SiteAnnouncement";

const DEFAULT_RESPONSE = {
  isEnabled: false,
  title: "Coming from our socials?",
  message:
    "Tap below to sign up and get the newest competitions and programs before anyone else.",
  imageUrl: "/images/TPD.png",
  primaryCtaLabel: "Sign up",
  primaryCtaUrl: "/auth/general/signup",
  secondaryCtaLabel: "Explore other opportunities",
  secondaryCtaUrl: "/business-opportunities",
  updatedAt: null,
};

export async function GET() {
  try {
    if (!isMongoDBConfigured()) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_RESPONSE,
      });
    }

    await connectToDatabase();

    let announcement = await SiteAnnouncement.findOne();
    if (!announcement) {
      announcement = await SiteAnnouncement.create({});
    }

    const data = announcement.toObject();

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Announcement fetch error:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_RESPONSE,
    });
  }
}
