import { connectToDatabase } from "../config/database";
import User, { type IUser } from "../models/User";
import {
  burnPasswordCheck,
  hashPassword,
  safeEqual,
  verifyPassword,
} from "./password";

export type LoginOutcome =
  | { status: "ok"; user: IUser }
  | { status: "invalid" }
  | { status: "not_approved" };

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Checks a student or organizer login. A legacy account whose password is
 * still plain text is upgraded to a bcrypt hash once the password matches.
 */
export async function loginUser(
  email: string,
  password: string,
  userType: "general" | "organizer",
): Promise<LoginOutcome> {
  await connectToDatabase();
  const user: IUser | null = await User.findOne({
    email: normalizeEmail(email),
    userType,
  });
  if (!user) {
    await burnPasswordCheck(password);
    return { status: "invalid" };
  }

  const check = await verifyPassword(password, user.password);
  if (!check.ok) return { status: "invalid" };
  if (check.needsRehash) {
    // updateOne, not save(): an old document missing a field that later
    // became required must not block the upgrade.
    await User.updateOne(
      { _id: user._id },
      { $set: { password: await hashPassword(password) } },
    );
  }

  if (!user.approved) return { status: "not_approved" };
  return { status: "ok", user };
}

/** The administrator account from the environment, or null when unset. */
export function adminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email: normalizeEmail(email), password };
}

export function isAdminLogin(email: string, password: string): boolean {
  const admin = adminCredentials();
  if (!admin) return false;
  const emailMatches = safeEqual(normalizeEmail(email), admin.email);
  const passwordMatches = safeEqual(password, admin.password);
  return emailMatches && passwordMatches;
}
