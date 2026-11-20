import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findById: vi.fn() }));

vi.mock("../config/database", () => ({
  connectToDatabase: vi.fn(async () => undefined),
  isMongoDBConfigured: () => true,
}));
vi.mock("../models/User", () => ({ default: db }));

import { signSession } from "../auth/session";
import { clearAuthCookie, setAuthCookie, verifyAuth } from "./auth";

const USER_ID = "64f000000000000000000001";

function requestWith(cookie: string) {
  return new NextRequest("https://example.com/api/auth/me", { headers: { cookie } });
}

beforeEach(() => {
  vi.stubEnv("AUTH_SECRET", "x".repeat(32));
  vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
  vi.stubEnv("ADMIN_PASSWORD", "long admin passphrase");
  db.findById.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("verifyAuth", () => {
  it("accepts a valid session for an existing, approved user", async () => {
    db.findById.mockResolvedValue({
      _id: USER_ID, email: "sam@example.com", userType: "general",
      firstName: "Sam", lastName: "Park", approved: true, school: "North", grade: "12",
    });
    const token = signSession({ sub: USER_ID, email: "sam@example.com", userType: "general" });
    const result = await verifyAuth(requestWith(`pd_session=${token}`));
    expect(result.success).toBe(true);
    expect(result.user).toMatchObject({ id: USER_ID, userType: "general", school: "North" });
    expect(db.findById).toHaveBeenCalledWith(USER_ID);
  });

  it("ignores the old plain-text credential cookies", async () => {
    const result = await verifyAuth(
      requestWith("auth_email=sam%40example.com; auth_password=pass1234; auth_usertype=general"),
    );
    expect(result.success).toBe(false);
    expect(db.findById).not.toHaveBeenCalled();
  });

  it("rejects a session whose user type no longer matches the account", async () => {
    db.findById.mockResolvedValue({ _id: USER_ID, userType: "general", approved: true });
    const token = signSession({ sub: USER_ID, email: "sam@example.com", userType: "organizer" });
    expect((await verifyAuth(requestWith(`pd_session=${token}`))).success).toBe(false);
  });

  it("rejects a session for an unapproved account", async () => {
    db.findById.mockResolvedValue({ _id: USER_ID, userType: "organizer", approved: false });
    const token = signSession({ sub: USER_ID, email: "sam@example.com", userType: "organizer" });
    expect((await verifyAuth(requestWith(`pd_session=${token}`))).success).toBe(false);
  });

  it("accepts an admin session only while it names the configured admin", async () => {
    const token = signSession({ sub: "admin", email: "admin@example.com", userType: "admin" });
    expect((await verifyAuth(requestWith(`pd_session=${token}`))).user?.userType).toBe("admin");

    vi.stubEnv("ADMIN_EMAIL", "new-admin@example.com");
    expect((await verifyAuth(requestWith(`pd_session=${token}`))).success).toBe(false);
  });
});

describe("session cookies", () => {
  it("set an httpOnly session cookie and expire the legacy credential cookies", () => {
    const response = NextResponse.json({});
    setAuthCookie(response, { sub: USER_ID, email: "sam@example.com", userType: "general" });
    const session = response.cookies.get("pd_session");
    expect(session?.httpOnly).toBe(true);
    expect(session?.value).not.toContain("pass");
    expect(response.cookies.get("auth_password")?.maxAge).toBe(0);
  });

  it("clear every auth cookie on logout", () => {
    const response = NextResponse.json({});
    clearAuthCookie(response);
    for (const name of ["pd_session", "auth_email", "auth_password", "auth_usertype"]) {
      expect(response.cookies.get(name)?.maxAge).toBe(0);
    }
  });
});
