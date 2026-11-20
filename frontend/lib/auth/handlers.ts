import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoDBConfigured } from "../config/database";
import { setAuthCookie } from "../middleware/auth";
import { validateLogin, withValidation } from "../middleware/validation";
import User from "../models/User";
import type { LoginData } from "../types/api";
import { loginUser, normalizeEmail } from "./login";
import { hashPassword } from "./password";

export function databaseUnavailable(): NextResponse {
  return NextResponse.json(
    { message: "Authentication not available - MongoDB not configured" },
    { status: 503 },
  );
}

export function serverError(context: string, error: unknown): NextResponse {
  console.error(`${context}:`, error);
  return NextResponse.json(
    { message: "Server error", success: false },
    { status: 500 },
  );
}

/** A user document as JSON, without the password field. */
function publicFields(user: InstanceType<typeof User>): Record<string, unknown> {
  const data = user.toObject();
  delete data.password;
  return data;
}

/** POST handler for the student and organizer login routes. */
export function userLoginHandler(
  userType: "general" | "organizer",
  successMessage: string,
) {
  return (request: NextRequest) =>
    withValidation<LoginData>(request, validateLogin, async (_request, data) => {
      if (!isMongoDBConfigured()) return databaseUnavailable();
      try {
        const outcome = await loginUser(data.email, data.password, userType);
        if (outcome.status === "invalid") {
          return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 400 },
          );
        }
        if (outcome.status === "not_approved") {
          return NextResponse.json(
            { message: "Account not approved yet" },
            { status: 403 },
          );
        }
        const { user } = outcome;
        const response = NextResponse.json(
          { message: successMessage, user: publicFields(user), success: true },
          { status: 200 },
        );
        setAuthCookie(response, {
          sub: user._id.toString(),
          email: user.email,
          userType,
        });
        return response;
      } catch (error) {
        return serverError(`${userType} login error`, error);
      }
    });
}

export type NewAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "general" | "organizer";
  school?: string;
  grade?: string;
  organization?: string;
  position?: string;
};

/** Creates an account with a hashed password and starts its session. */
export async function createAccount(
  fields: NewAccount,
  successMessage: string,
): Promise<NextResponse> {
  await connectToDatabase();
  const email = normalizeEmail(fields.email);
  if (await User.findOne({ email })) {
    return NextResponse.json(
      { message: "User already exists with this email" },
      { status: 400 },
    );
  }

  const user = new User({
    ...fields,
    email,
    password: await hashPassword(fields.password),
    approved: true,
    favourites: [],
  });
  const response = NextResponse.json(
    { message: successMessage, user: publicFields(user), success: true },
    { status: 201 },
  );
  // Sign before saving, so a missing AUTH_SECRET fails the request without
  // leaving behind an account the user was never logged in to.
  setAuthCookie(response, {
    sub: user._id.toString(),
    email,
    userType: fields.userType,
  });
  await user.save();
  return response;
}
