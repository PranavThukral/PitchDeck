import mongoose, { Schema, Document } from "mongoose";

export interface ISiteAnnouncement extends Document {
  isEnabled: boolean;
  title: string;
  message: string;
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  updatedAt: Date;
  createdAt: Date;
}

const SiteAnnouncementSchema = new Schema<ISiteAnnouncement>(
  {
    isEnabled: { type: Boolean, default: false },
    title: {
      type: String,
      default: "Coming from our socials?",
      trim: true,
    },
    message: {
      type: String,
      default:
        "Tap below to sign up and get the newest competitions and programs before anyone else.",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "/images/TPD.png",
      trim: true,
    },
    primaryCtaLabel: {
      type: String,
      default: "Sign up",
      trim: true,
    },
    primaryCtaUrl: {
      type: String,
      default: "/auth/general/signup",
      trim: true,
    },
    secondaryCtaLabel: {
      type: String,
      default: "Explore other opportunities",
      trim: true,
    },
    secondaryCtaUrl: {
      type: String,
      default: "/business-opportunities",
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.SiteAnnouncement ||
  mongoose.model<ISiteAnnouncement>(
    "SiteAnnouncement",
    SiteAnnouncementSchema,
  );
