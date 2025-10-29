import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "general" | "organizer" | "admin";
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
  approved: boolean;
  favourites: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // Plain text password
    userType: {
      type: String,
      required: true,
      enum: ["general", "organizer", "admin"],
      default: "general",
    },
    // For general users (students)
    school: {
      type: String,
      required: function (this: IUser) {
        return this.userType === "general";
      },
      trim: true,
    },
    grade: {
      type: String,
      required: function (this: IUser) {
        return this.userType === "general";
      },
      trim: true,
    },
    // For organizers
    organization: {
      type: String,
      required: function (this: IUser) {
        return this.userType === "organizer";
      },
      trim: true,
    },
    position: {
      type: String,
      required: function (this: IUser) {
        return this.userType === "organizer";
      },
      trim: true,
    },
    approved: { type: Boolean, default: true },
    favourites: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Competition", default: [] },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
UserSchema.index({ userType: 1 });
UserSchema.index({ approved: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
