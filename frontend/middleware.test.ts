import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { middleware } from "./middleware";

function apiRequest(origin: string | null, method = "GET") {
  const headers = origin ? { origin } : undefined;
  return new NextRequest("https://thepitchdeck.com/api/auth/me", { method, headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("API CORS", () => {
  it("allows the site's own origin with credentials", () => {
    const response = middleware(apiRequest("https://thepitchdeck.com"));
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://thepitchdeck.com");
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("gives any other origin no CORS headers", () => {
    const response = middleware(apiRequest("https://evil.example"));
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
    expect(response.headers.get("Vary")).toBe("Origin");
  });

  it("allows origins listed in ALLOWED_ORIGINS", () => {
    vi.stubEnv("ALLOWED_ORIGINS", "https://partner.example, https://staging.example");
    const response = middleware(apiRequest("https://staging.example"));
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://staging.example");
  });

  it("refuses a preflight from an unknown origin", () => {
    const response = middleware(apiRequest("https://evil.example", "OPTIONS"));
    expect(response.status).toBe(403);
  });

  it("answers a preflight from an allowed origin", () => {
    const response = middleware(apiRequest("https://thepitchdeck.com", "OPTIONS"));
    expect(response.status).toBe(204);
  });
});
