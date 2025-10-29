import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface ICompetition extends Document {
  title: string;
  organizer: string;
  organizerEmail: string;
  organizerId: ObjectId;
  logo?: string;
  gradeEligibility: string;
  deadline: Date;
  prize: string;
  status: "draft" | "pending" | "approved" | "rejected" | "live" | "closed";
  description: string;
  applicationType: "individual" | "team" | "both";
  applyUrl?: string;
  frequency: "one-time" | "annual" | "monthly" | "weekly";
  dates: [string, string]; // [start, end] in yyyy-mm-dd
  location: string;
  cost: string;
  category: "case-competition" | "hackathon" | "business-plan" | "other";
  maxParticipants?: number;
  requirements?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  tags: string[];
  approved: boolean;
  rejectionReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    organizerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    gradeEligibility: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    prize: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "pending", "approved", "rejected", "live", "closed"],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    applicationType: {
      type: String,
      required: true,
      enum: ["individual", "team", "both"],
    },
    applyUrl: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["one-time", "annual", "monthly", "weekly"],
    },
    dates: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length === 2;
        },
        message: "Dates array must contain exactly 2 elements [start, end]",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["case-competition", "hackathon", "business-plan", "other"],
      default: "case-competition",
    },
    maxParticipants: {
      type: Number,
      min: 1,
    },
    requirements: {
      type: String,
      maxlength: 2000,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: "Maximum 10 tags allowed",
      },
    },
    approved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
CompetitionSchema.index({ status: 1 });
CompetitionSchema.index({ approved: 1 });
CompetitionSchema.index({ organizerId: 1 });
CompetitionSchema.index({ deadline: 1 });
CompetitionSchema.index({ category: 1 });
CompetitionSchema.index({ tags: 1 });
CompetitionSchema.index({ createdAt: -1 });

// Pre-save middleware to update status based on approval
CompetitionSchema.pre("save", function (next) {
  if (this.approved && this.status === "pending") {
    this.status = "live";
    this.approvedAt = new Date();
  } else if (!this.approved && this.rejectionReason) {
    this.status = "rejected";
  }
  next();
});

export default mongoose.models.Competition ||
  mongoose.model<ICompetition>("Competition", CompetitionSchema);
