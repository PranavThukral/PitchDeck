import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../../lib/config/database";
import User from "../../../../../lib/models/User";
import {
  validateGeneralSignup,
  withValidation,
} from "../../../../../lib/middleware/validation";
import { setAuthCookie } from "../../../../../lib/middleware/auth";
import { SignupData } from "../../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<SignupData>(
    request,
    validateGeneralSignup,
    async (_request, data) => {
      const { firstName, lastName, email, password, school, grade } = data;

      try {
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Authentication not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json(
            { message: "User already exists with this email" },
            { status: 400 },
          );
        }

        // Create new user with plain text password
        const user = new User({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password: password, // Store plain text password
          userType: "general",
          school: school.trim(),
          grade: grade.trim(),
          approved: true, // General users are auto-approved
          favourites: [],
        });

        await user.save();

        // Remove password from response
        const { password: _, ...userData } = user.toObject();

        const response = NextResponse.json(
          {
            message: "Account created successfully",
            user: userData,
            success: true,
          },
          { status: 201 },
        );

        // Set auth cookies
        setAuthCookie(response, user.email, password, user.userType);

        return response;
      } catch (error) {
        console.error("General signup error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
