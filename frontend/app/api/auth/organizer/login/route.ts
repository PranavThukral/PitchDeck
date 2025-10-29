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
        if (!isMongoDBConfigured()) {
          return NextResponse.json(
            {
              message: "Authentication not available - MongoDB not configured",
            },
            { status: 503 },
          );
        }

        await connectToDatabase();

        // Find user with organizer userType and plain text password
        const user = await User.findOne({
          email: email.toLowerCase().trim(),
          password: password, // Plain text password comparison
          userType: "organizer",
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
            message: "Organizer login successful",
            user: userData,
            success: true,
          },
          { status: 200 },
        );

        // Set auth cookies
        setAuthCookie(response, user.email, password, user.userType);

        return response;
      } catch (error) {
        console.error("Organizer login error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
