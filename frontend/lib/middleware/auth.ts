import { NextRequest, NextResponse } from "next/server";
import { adminCredentials } from "../auth/login";
import {
  readSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  signSession,
  type SessionClaims,
  type UserType,
} from "../auth/session";
import { connectToDatabase, isMongoDBConfigured } from "../config/database";
import User from "../models/User";

export interface AuthUser {
  id: string;
  email: string;
  userType: UserType;
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

// The previous scheme kept the email, password and user type in these
// cookies. Every login and logout clears them so browsers drop old values.
const LEGACY_COOKIES = ["auth_email", "auth_password", "auth_usertype"];

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

/** Starts a session. Throws if AUTH_SECRET is not configured. */
export function setAuthCookie(
  response: NextResponse,
  claims: SessionClaims,
): void {
  response.cookies.set(
    SESSION_COOKIE,
    signSession(claims),
    cookieOptions(SESSION_TTL_SECONDS),
  );
  for (const name of LEGACY_COOKIES) {
    response.cookies.set(name, "", cookieOptions(0));
  }
}

export function clearAuthCookie(response: NextResponse): void {
  for (const name of [SESSION_COOKIE, ...LEGACY_COOKIES]) {
    response.cookies.set(name, "", cookieOptions(0));
  }
}

const NOT_AUTHENTICATED: AuthResult = {
  success: false,
  message: "Not authenticated",
};

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const claims = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) return NOT_AUTHENTICATED;

  if (claims.userType === "admin") {
    // Only valid while the token names the currently configured admin.
    const admin = adminCredentials();
    if (!admin || claims.sub !== "admin" || claims.email !== admin.email) {
      return NOT_AUTHENTICATED;
    }
    return {
      success: true,
      user: {
        id: "admin",
        email: admin.email,
        userType: "admin",
        firstName: "Admin",
        lastName: "User",
        approved: true,
      },
    };
  }

  if (!isMongoDBConfigured()) {
    return { success: false, message: "Authentication not available" };
  }

  try {
    await connectToDatabase();
    const user = await User.findById(claims.sub);
    if (!user || user.userType !== claims.userType) return NOT_AUTHENTICATED;
    if (!user.approved) {
      return { success: false, message: "User account not approved" };
    }
    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        approved: user.approved,
        school: user.school,
        grade: user.grade,
        organization: user.organization,
        position: user.position,
      },
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { success: false, message: "Authentication error" };
  }
}
