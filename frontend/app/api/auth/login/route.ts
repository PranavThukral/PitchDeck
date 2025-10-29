import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../lib/config/database";
import User from "../../../../lib/models/User";
import {
  validateLogin,
  withValidation,
} from "../../../../lib/middleware/validation";
import { setAuthCookie } from "../../../../lib/middleware/auth";
import { LoginData } from "../../../../lib/types/api";

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

        // Find user with plain text password comparison
        const user = await User.findOne({
          email: email.toLowerCase().trim(),
          password: password, // Plain text password comparison
        });

        if (!user) {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 },
          );
        }

        if (!user.approved) {
          return NextResponse.json(
            { message: "User account not approved" },
            { status: 403 },
          );
        }

        const { password: _, ...userData } = user.toObject();

        const response = NextResponse.json(
          { message: "Login successful", user: userData },
          { status: 200 },
        );

        // Set auth cookies
        setAuthCookie(response, user.email, password, user.userType);

        return response;
      } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
      }
    },
  );
}
