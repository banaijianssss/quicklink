import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getHostname(req: NextRequest) {
  return req.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
}

function getAppHostname() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").hostname.toLowerCase();
  } catch {
    return "localhost";
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const host = getHostname(req);
  const appHost = getAppHostname();

  if (host && host !== appHost && host !== "localhost" && host !== "127.0.0.1") {
    const slugMatch = path.match(/^\/([a-zA-Z0-9_-]+)$/);
    if (slugMatch && !path.startsWith("/api") && !path.startsWith("/_next")) {
      const slug = slugMatch[1];
      const rewrite = req.nextUrl.clone();
      rewrite.pathname = `/r/${slug}`;
      rewrite.searchParams.set("domain", host);
      return NextResponse.rewrite(rewrite);
    }
    const bioMatch = path.match(/^\/p\/([a-zA-Z0-9_-]+)$/);
    if (bioMatch) {
      const rewrite = req.nextUrl.clone();
      rewrite.pathname = `/p/${bioMatch[1]}`;
      rewrite.searchParams.set("domain", host);
      return NextResponse.rewrite(rewrite);
    }
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const isApiV1 =
    path.startsWith("/api/v1/") ||
    path.startsWith("/api/account/api-key") ||
    path.startsWith("/api/domains") ||
    path.startsWith("/api/bio") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/api/folders") ||
    path.startsWith("/api/team");

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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};