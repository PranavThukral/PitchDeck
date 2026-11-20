import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "pd_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type UserType = "general" | "organizer" | "admin";

export type SessionClaims = {
  /** The user's database id, or "admin" for the configured administrator. */
  sub: string;
  email: string;
  userType: UserType;
};

const USER_TYPES: readonly string[] = ["general", "organizer", "admin"];

function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return secret;
}

export function signSession(claims: SessionClaims): string {
  return jwt.sign(
    { email: claims.email, userType: claims.userType },
    sessionSecret(),
    {
      algorithm: "HS256",
      subject: claims.sub,
      expiresIn: SESSION_TTL_SECONDS,
    },
  );
}

/** The claims of a valid, unexpired token; null for anything else. */
export function readSession(token: string | undefined): SessionClaims | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string") return null;
    const { sub, email, userType } = payload;
    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof userType !== "string" ||
      !USER_TYPES.includes(userType)
    ) {
      return null;
    }
    return { sub, email, userType: userType as UserType };
  } catch {
    return null;
  }
}
