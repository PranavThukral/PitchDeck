import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IBusinessOpportunity extends Document {
  title: string;
  company: string;
  companyEmail: string;
  organizerId: ObjectId;
  logo?: string;
  type: "internship" | "job" | "entrepreneurship" | "partnership" | "other";
  location: string;
  remote: boolean;
  deadline: Date;
  description: string;
  requirements: string;
  compensation?: string;
  duration?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  applyUrl?: string;
  tags: string[];
  likes: number;
  status: "draft" | "pending" | "approved" | "rejected" | "live" | "closed";
  approved: boolean;
  rejectionReason?: string;
  submittedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessOpportunitySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    type: {
      type: String,
      required: true,
      enum: ["internship", "job", "entrepreneurship", "partnership", "other"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    remote: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    requirements: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    compensation: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
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
    applyUrl: {
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
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "pending", "approved", "rejected", "live", "closed"],
      default: "pending",
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
BusinessOpportunitySchema.index({ status: 1 });
BusinessOpportunitySchema.index({ approved: 1 });
BusinessOpportunitySchema.index({ organizerId: 1 });
BusinessOpportunitySchema.index({ deadline: 1 });
BusinessOpportunitySchema.index({ type: 1 });
BusinessOpportunitySchema.index({ tags: 1 });
BusinessOpportunitySchema.index({ createdAt: -1 });
BusinessOpportunitySchema.index({ remote: 1 });

// Pre-save middleware to update status based on approval
BusinessOpportunitySchema.pre("save", function (next) {
  if (this.approved && this.status === "pending") {
    this.status = "live";
    this.approvedAt = new Date();
  } else if (!this.approved && this.rejectionReason) {
    this.status = "rejected";
  }
  next();
});

export default mongoose.models.BusinessOpportunity ||
  mongoose.model<IBusinessOpportunity>(
    "BusinessOpportunity",
    BusinessOpportunitySchema,
  );
