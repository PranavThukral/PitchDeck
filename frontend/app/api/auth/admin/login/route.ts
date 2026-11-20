import { NextRequest, NextResponse } from "next/server";
import { serverError } from "@/lib/auth/handlers";
import { adminCredentials, isAdminLogin } from "@/lib/auth/login";
import { setAuthCookie } from "@/lib/middleware/auth";
import {
  validateAdminLogin,
  withValidation,
} from "@/lib/middleware/validation";
import type { LoginData } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  return withValidation<LoginData>(
    request,
    validateAdminLogin,
    async (_request, data) => {
      const admin = adminCredentials();
      if (!admin) {
        return NextResponse.json(
          { message: "Admin login is not configured" },
          { status: 503 },
        );
      }
      if (!isAdminLogin(data.email, data.password)) {
        return NextResponse.json(
          { message: "Invalid admin credentials" },
          { status: 401 },
        );
      }

      try {
        const response = NextResponse.json(
          {
            message: "Admin login successful",
            user: {
              email: admin.email,
              userType: "admin",
              firstName: "Admin",
              lastName: "User",
              approved: true,
            },
            success: true,
          },
          { status: 200 },
        );
        setAuthCookie(response, {
          sub: "admin",
          email: admin.email,
          userType: "admin",
        });
        return response;
      } catch (error) {
        return serverError("Admin login error", error);
      }
    },
  );
}
