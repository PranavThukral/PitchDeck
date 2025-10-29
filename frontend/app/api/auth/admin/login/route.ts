import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  isMongoDBConfigured,
} from "../../../../../lib/config/database";
import User from "../../../../../lib/models/User";
import {
  validateAdminLogin,
  withValidation,
} from "../../../../../lib/middleware/validation";
import { setAuthCookie } from "../../../../../lib/middleware/auth";
import { LoginData } from "../../../../../lib/types/api";

// Admin credentials (in production, this should be in environment variables)
const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "Admin@pass";

export async function POST(request: NextRequest) {
  return withValidation<LoginData>(
    request,
    validateAdminLogin,
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

        // Check hardcoded admin credentials with plain text comparison
        if (
          email.toLowerCase().trim() !== ADMIN_EMAIL ||
          password !== ADMIN_PASSWORD
        ) {
          return NextResponse.json(
            { message: "Invalid admin credentials" },
            { status: 401 },
          );
        }

        await connectToDatabase();

        // Check if admin user exists in database, if not create one
        let adminUser = await User.findOne({
          email: ADMIN_EMAIL,
          userType: "admin",
        });

        if (!adminUser) {
          // Create admin user in database with plain text password
          adminUser = new User({
            firstName: "Admin",
            lastName: "User",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD, // Store plain text password
            userType: "admin",
            approved: true,
            favourites: [],
          });

          await adminUser.save();
        }

        // Remove password from response
        const { password: _, ...userData } = adminUser.toObject();

        const response = NextResponse.json(
          {
            message: "Admin login successful",
            user: userData,
            success: true,
          },
          { status: 200 },
        );

        // Set auth cookies
        setAuthCookie(
          response,
          adminUser.email,
          ADMIN_PASSWORD,
          adminUser.userType,
        );

        return response;
      } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
          { message: "Server error", success: false },
          { status: 500 },
        );
      }
    },
  );
}
