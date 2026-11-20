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

  // Check if site is under construction
  const isUnderConstruction = false; // Disabled for dashboard testing
  // process.env.NEXT_PUBLIC_UNDER_CONSTRUCTION === "true";

  if (isUnderConstruction) {
    const url = request.nextUrl.clone();
    const path = url.pathname;

    // List of paths that should redirect to under-construction page when flag is true
    const protectedPaths = [
      "/auth/login",
      "/auth/signup",
      "/apply",
      "/dashboard",
      "/about",
      "/winners",
    ];

    // Check if the current path starts with any of the protected paths
    const isProtectedPath = protectedPaths.some(
      (protectedPath) =>
        path === protectedPath || path.startsWith(`${protectedPath}/`),
    );

    // Only redirect if it's a protected path and not already the under-construction page
    if (isProtectedPath && !path.startsWith("/under-construction")) {
      url.pathname = "/under-construction";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/api/:path*",
    "/auth/:path*",
    "/apply/:path*",
    "/apply",
    "/dashboard/:path*",
    "/dashboard",
    "/about",
    "/winners",
  ],
};
