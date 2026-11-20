import { describe, expect, it } from "vitest";
import { hashPassword, isHashed, safeEqual, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("produces a salted bcrypt hash, never the password itself", async () => {
    const first = await hashPassword("correct horse");
    const second = await hashPassword("correct horse");
    expect(isHashed(first)).toBe(true);
    expect(first).not.toContain("correct horse");
    expect(first).not.toBe(second);
  });
});

describe("verifyPassword", () => {
  it("accepts the right password against a hash and needs no rehash", async () => {
    const stored = await hashPassword("correct horse");
    expect(await verifyPassword("correct horse", stored)).toEqual({ ok: true, needsRehash: false });
  });

  it("rejects the wrong password against a hash", async () => {
    const stored = await hashPassword("correct horse");
    expect(await verifyPassword("battery staple", stored)).toEqual({ ok: false, needsRehash: false });
  });

  it("accepts a legacy plain-text password and asks for a rehash", async () => {
    expect(await verifyPassword("pass1234", "pass1234")).toEqual({ ok: true, needsRehash: true });
  });

  it("rejects a wrong legacy password without asking for a rehash", async () => {
    expect(await verifyPassword("pass1235", "pass1234")).toEqual({ ok: false, needsRehash: false });
  });

  it("does not treat a hash typed as a password as a match", async () => {
    const stored = await hashPassword("correct horse");
    expect((await verifyPassword(stored, stored)).ok).toBe(false);
  });
});

describe("safeEqual", () => {
  it("compares strings of different lengths without throwing", () => {
    expect(safeEqual("a", "a")).toBe(true);
    expect(safeEqual("a", "ab")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});
