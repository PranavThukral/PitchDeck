import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import User from "../../../../lib/models/User";
import {
  validateSignup,
  withValidation,
} from "../../../../lib/middleware/validation";
import { SignupData } from "../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<SignupData>(
    request,
    validateSignup,
    async (request, data) => {
      const {
        firstName,
        lastName,
        email,
        password,
        userType = "general",
        school,
        grade,
        organization,
        position,
        approved = true,
        favourites = [],
      } = data;

      try {
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Registration not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        await connectToDatabase();

        const existingUser = await User.findOne({
          email: email.toLowerCase().trim(),
        });
        if (existingUser) {
          return NextResponse.json(
            { message: "User already exists" },
            { status: 400 },
          );
        }

        const user = new User({
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          password: password, // Plain text password
          userType,
          school,
          grade,
          organization,
          position,
          approved,
          favourites,
        });

        await user.save();

        const { password: _, ...userData } = user.toObject();

        return NextResponse.json(
          {
            message: "User created successfully",
            user: userData,
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
      }
    },
  );
}
