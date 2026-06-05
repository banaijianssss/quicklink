import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;
  // /api/v1/* and /api/account/api-key use their own API key auth — skip session check
  const isApiV1 = path.startsWith("/api/v1/") || path.startsWith("/api/account/api-key");
  const isProtected =
    !isApiV1 &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/settings") ||
      path.startsWith("/api/links") ||
      path.startsWith("/api/billing") ||
      path.startsWith("/api/qr"));

  if (isProtected && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/api/links/:path*",
    "/api/billing/:path*",
    "/api/qr/:path*",
    "/api/account/:path*",
  ],
};
