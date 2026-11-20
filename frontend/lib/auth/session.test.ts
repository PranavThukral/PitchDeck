import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readSession, SESSION_TTL_SECONDS, signSession } from "./session";

const SECRET = "x".repeat(32);
const claims = { sub: "64f000000000000000000001", email: "sam@example.com", userType: "general" as const };

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("session tokens", () => {
  it("round-trips the claims", () => {
    expect(readSession(signSession(claims))).toEqual(claims);
  });

  it("holds no password", () => {
    const payload = jwt.decode(signSession(claims)) as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(["email", "exp", "iat", "sub", "userType"]);
  });

  it("rejects a token whose payload was edited", () => {
    const [header, , signature] = signSession(claims).split(".");
    const forged = Buffer.from(JSON.stringify({ ...claims, userType: "admin" })).toString("base64url");
    expect(readSession(`${header}.${forged}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = jwt.sign({ email: claims.email, userType: "general" }, "y".repeat(32), { subject: claims.sub });
    expect(readSession(token)).toBeNull();
  });

  it("rejects an unsigned token", () => {
    const token = jwt.sign({ email: claims.email, userType: "admin" }, "", { algorithm: "none", subject: "admin" });
    expect(readSession(token)).toBeNull();
  });

  it("rejects an unknown user type", () => {
    const token = jwt.sign({ email: claims.email, userType: "superuser" }, SECRET, { subject: claims.sub });
    expect(readSession(token)).toBeNull();
  });

  it("expires after the session lifetime", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = signSession(claims);
    vi.setSystemTime(new Date(Date.parse("2026-01-01T00:00:00Z") + (SESSION_TTL_SECONDS + 1) * 1000));
    expect(readSession(token)).toBeNull();
  });

  it("refuses to sign, and accepts nothing, without a long enough secret", () => {
    const token = signSession(claims);
    vi.stubEnv("AUTH_SECRET", "short");
    expect(() => signSession(claims)).toThrow(/AUTH_SECRET/);
    expect(readSession(token)).toBeNull();
  });

  it("returns null for a missing cookie", () => {
    expect(readSession(undefined)).toBeNull();
  });
});
