import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findOne: vi.fn(), updateOne: vi.fn() }));

vi.mock("../config/database", () => ({ connectToDatabase: vi.fn(async () => undefined) }));
vi.mock("../models/User", () => ({ default: db }));

import { adminCredentials, isAdminLogin, loginUser } from "./login";
import { hashPassword, isHashed } from "./password";

function account(password: string, approved = true) {
  return { _id: "64f000000000000000000001", email: "sam@example.com", password, approved };
}

beforeEach(() => {
  db.findOne.mockReset();
  db.updateOne.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("loginUser", () => {
  it("looks the account up by normalized email and user type", async () => {
    db.findOne.mockResolvedValue(null);
    await loginUser("  Sam@Example.COM ", "whatever", "organizer");
    expect(db.findOne).toHaveBeenCalledWith({ email: "sam@example.com", userType: "organizer" });
  });

  it("logs in a hashed account without rewriting it", async () => {
    db.findOne.mockResolvedValue(account(await hashPassword("correct horse")));
    expect((await loginUser("sam@example.com", "correct horse", "general")).status).toBe("ok");
    expect(db.updateOne).not.toHaveBeenCalled();
  });

  it("upgrades a legacy plain-text password to a hash on a correct login", async () => {
    db.findOne.mockResolvedValue(account("pass1234"));
    expect((await loginUser("sam@example.com", "pass1234", "general")).status).toBe("ok");
    expect(db.updateOne).toHaveBeenCalledTimes(1);
    const [filter, update] = db.updateOne.mock.calls[0];
    expect(filter).toEqual({ _id: "64f000000000000000000001" });
    expect(isHashed(update.$set.password)).toBe(true);
  });

  it("does not upgrade a legacy account on a wrong password", async () => {
    db.findOne.mockResolvedValue(account("pass1234"));
    expect((await loginUser("sam@example.com", "pass12345", "general")).status).toBe("invalid");
    expect(db.updateOne).not.toHaveBeenCalled();
  });

  it("rejects an unknown email", async () => {
    db.findOne.mockResolvedValue(null);
    expect((await loginUser("nobody@example.com", "pass1234", "general")).status).toBe("invalid");
  });

  it("reports an unapproved account only after the password matched", async () => {
    db.findOne.mockResolvedValue(account(await hashPassword("correct horse"), false));
    expect((await loginUser("sam@example.com", "correct horse", "organizer")).status).toBe("not_approved");
    expect((await loginUser("sam@example.com", "wrong", "organizer")).status).toBe("invalid");
  });
});

describe("admin credentials", () => {
  it("are disabled while either variable is unset", () => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(adminCredentials()).toBeNull();
    expect(isAdminLogin("admin@example.com", "")).toBe(false);
  });

  it("match the configured account, with the email case-insensitive", () => {
    vi.stubEnv("ADMIN_EMAIL", "Admin@Example.com");
    vi.stubEnv("ADMIN_PASSWORD", "long admin passphrase");
    expect(isAdminLogin("admin@example.com", "long admin passphrase")).toBe(true);
    expect(isAdminLogin("admin@example.com", "long admin passphrasE")).toBe(false);
    expect(isAdminLogin("other@example.com", "long admin passphrase")).toBe(false);
  });

  it("no longer accept the old built-in defaults", () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(isAdminLogin("admin@admin.com", "Admin@pass")).toBe(false);
  });
});
