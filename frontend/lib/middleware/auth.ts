import { NextRequest, NextResponse } from "next/server";
import User from "../models/User";
import { connectToDatabase, isMongoDBConfigured } from "../config/database";

export interface AuthUser {
  id: string;
  email: string;
  userType: "general" | "organizer" | "admin";
  firstName: string;
  lastName: string;
  approved: boolean;
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

export function setAuthCookie(
  response: NextResponse,
  email: string,
  password: string,
  userType: string,
): void {
  // Set individual cookies for each auth component
  response.cookies.set("auth_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });

  response.cookies.set("auth_password", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });

  response.cookies.set("auth_usertype", userType, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set("auth_email", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("auth_password", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("auth_usertype", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const email = request.cookies.get("auth_email")?.value;
    const password = request.cookies.get("auth_password")?.value;
    const userType = request.cookies.get("auth_usertype")?.value as
      | "general"
      | "organizer"
      | "admin";

    if (!email || !password || !userType) {
      return {
        success: false,
        message: "No authentication cookies found",
      };
    }

    // Handle admin authentication (hardcoded credentials)
    if (userType === "admin") {
      if (email === "admin@admin.com" && password === "Admin@pass") {
        return {
          success: true,
          user: {
            id: "admin",
            email: "admin@admin.com",
            userType: "admin",
            firstName: "Admin",
            lastName: "User",
            approved: true,
          },
        };
      } else {
        return {
          success: false,
          message: "Invalid admin credentials",
        };
      }
    }

    if (!isMongoDBConfigured()) {
      // Return a mock user object when MongoDB is not configured
      return {
        success: true,
        user: {
          id: "local_user",
          email: email,
          userType: userType,
          firstName: "Local",
          lastName: "User",
          approved: true,
        },
      };
    }

    // Test mode - allow test credentials to work without database verification
    if (
      email === "test@example.com" &&
      password === "testpassword123" &&
      userType === "general"
    ) {
      return {
        success: true,
        user: {
          id: "test_user",
          email: email,
          userType: userType,
          firstName: "Test",
          lastName: "User",
          approved: true,
          school: "Test School",
          grade: "12",
        },
      };
    }

    await connectToDatabase();

    // Find user in database with plain text password match
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      password: password, // Plain text password comparison
      userType: userType,
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid credentials or user not found",
      };
    }

    if (!user.approved) {
      return {
        success: false,
        message: "User account not approved",
      };
    }

    // Return user without password
    const { password: _, ...userData } = user.toObject();

    return {
      success: true,
      user: {
        id: userData._id.toString(),
        email: userData.email,
        userType: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName,
        approved: userData.approved,
        school: userData.school,
        grade: userData.grade,
        organization: userData.organization,
        position: userData.position,
      },
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      success: false,
      message: "Authentication error",
    };
  }
}

export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AuthUser | null> {
  const authResult = await verifyAuth(request);
  return authResult.success ? authResult.user || null : null;
}

export async function requireAuth(
  request: NextRequest,
  allowedUserTypes?: ("general" | "organizer" | "admin")[],
): Promise<{ success: boolean; user?: AuthUser; response?: NextResponse }> {
  const authResult = await verifyAuth(request);

  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      response: NextResponse.json(
        { message: authResult.message || "Not authenticated" },
        { status: 401 },
      ),
    };
  }

  if (
    allowedUserTypes &&
    !allowedUserTypes.includes(authResult.user.userType)
  ) {
    return {
      success: false,
      response: NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return {
    success: true,
    user: authResult.user,
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  allowedUserTypes?: ("general" | "organizer" | "admin")[],
): Promise<NextResponse> {
  const authCheck = await requireAuth(request, allowedUserTypes);

  if (!authCheck.success || !authCheck.user) {
    return authCheck.response!;
  }

  return await handler(request, authCheck.user);
}

// Middleware for checking specific user types
export async function requireGeneral(request: NextRequest) {
  return requireAuth(request, ["general"]);
}

export async function requireOrganizer(request: NextRequest) {
  return requireAuth(request, ["organizer"]);
}

export async function requireAdmin(request: NextRequest) {
  return requireAuth(request, ["admin"]);
}

export async function requireOrganizerOrAdmin(request: NextRequest) {
  return requireAuth(request, ["organizer", "admin"]);
}
