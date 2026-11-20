import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Origins other than the site's own that may call the API with cookies,
// from ALLOWED_ORIGINS (comma separated). Every other origin gets no CORS
// headers, so browsers refuse it the response.
function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowed =
      origin !== null &&
      (origin === request.nextUrl.origin || allowedOrigins().includes(origin));

    const headers = new Headers({ Vary: "Origin" });
    if (allowed) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: allowed ? 204 : 403, headers });
    }

    const response = NextResponse.next();
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
