import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieData: Record<string, string> = {};

  const authEmail = request.cookies.get("auth_email")?.value;
  const authPassword = request.cookies.get("auth_password")?.value;
  const authUserType = request.cookies.get("auth_usertype")?.value;

  if (authEmail) cookieData.auth_email = authEmail;
  if (authPassword) cookieData.auth_password = authPassword;
  if (authUserType) cookieData.auth_usertype = authUserType;

  return NextResponse.json({
    cookies: cookieData,
    headers: {
      cookie: request.headers.get("cookie"),
    },
    timestamp: new Date().toISOString(),
  });
}
