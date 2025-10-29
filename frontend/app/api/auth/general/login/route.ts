import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../../lib/config/database";
import User from "../../../../../lib/models/User";
import {
  validateLogin,
  withValidation,
} from "../../../../../lib/middleware/validation";
import { setAuthCookie } from "../../../../../lib/middleware/auth";
import { LoginData } from "../../../../../lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<LoginData>(
    request,
    validateLogin,
    async (_request, data) => {
      const { email, password } = data;

      try {
        // Temporarily bypass database check for testing - allow any credentials
        const response = NextResponse.json(
          {
            message: "Login successful (testing mode)",
            user: {
              _id: "test_user",
              email: email.toLowerCase().trim(),
              userType: "general",
              firstName: "Test",
              lastName: "User",
              approved: true,
              school: "Test School",
              grade: "12",
            },
            success: true,
          },
          { status: 200 },
        );

        // Set auth cookies for testing
        setAuthCookie(
          response,
          email.toLowerCase().trim(),
          password,
          "general",
        );
        return response;

        // Original database code (commented out for testing)
        /*
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Authentication not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        await connectToDatabase();

        // Find user with general userType and plain text password
        const user = await User.findOne({
          email: email.toLowerCase().trim(),
          password: password, // Plain text password comparison
          userType: "general",
        });

        if (!user) {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 },
          );
        }

        // Check if user is approved
        if (!user.approved) {
          return NextResponse.json(
            { message: "Account not approved yet" },
            { status: 403 },
          );
        }

        // Remove password from response
        const { password: _, ...userData } = user.toObject();

        const response = NextResponse.json(
          {
            message: "Login successful",
            user: userData,
            success: true,
          },
          { status: 200 },
        );

        // Set auth cookies
        setAuthCookie(response, user.email, password, user.userType);

        return response;
        */
      } catch (error) {
        console.error("General login error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
