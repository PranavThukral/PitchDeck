import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "node:crypto";

const BCRYPT_ROUNDS = 12;
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

// A real hash of a random string. Comparing against it when no account
// matches keeps a failed login as slow as a wrong password, so response
// times don't reveal which emails have accounts.
const DUMMY_HASH =
  "$2b$12$EL8xBSGDvG42YgbVoZNEReSWM.T5D7M398Ojpke3QTlxOgpghVYju";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function isHashed(stored: string): boolean {
  return BCRYPT_HASH.test(stored);
}

/** Constant-time string comparison for values of any length. */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export type PasswordCheck = { ok: boolean; needsRehash: boolean };

/**
 * Checks a password against the stored value. Accounts created before
 * passwords were hashed still hold plain text: those are compared in
 * constant time and reported with needsRehash so the caller can upgrade them.
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<PasswordCheck> {
  if (isHashed(stored)) {
    return { ok: await bcrypt.compare(plain, stored), needsRehash: false };
  }
  const ok = safeEqual(plain, stored);
  return { ok, needsRehash: ok };
}

/** Spends the same time as a real check when there is no account to check. */
export async function burnPasswordCheck(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_HASH);
}
