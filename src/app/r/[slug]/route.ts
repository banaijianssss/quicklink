import { prisma } from "@/lib/db";
import {
  isLinkExpired,
  isLinkNotStarted,
  recordClick,
  resolveLinkDestination,
} from "@/lib/links";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { resolveDestination } from "@/lib/targeting";
import { dispatchClickWebhooks } from "@/lib/webhooks";
import { getAppUrl } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { after, NextResponse } from "next/server";

function unlockCookieValue(linkId: string, passwordHash: string) {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`${linkId}:${passwordHash}`).digest("hex");
}

function passwordFormHtml(slug: string, error?: string) {
  const action = `/r/${slug}`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>受保护的链接</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f8fafc; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; width: min(420px, 92vw); box-shadow: 0 8px 24px rgba(15,23,42,.06); }
    h1 { font-size: 18px; margin: 0 0 8px; color: #0f172a; }
    p { margin: 0 0 16px; color: #64748b; font-size: 14px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    button { margin-top: 12px; width: 100%; padding: 10px 12px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; }
    .err { color: #dc2626; font-size: 13px; margin-top: 8px; }
  </style>
</head>
<body>
  <form class="card" method="POST" action="${action}">
    <h1>此链接受密码保护</h1>
    <p>请输入密码后继续访问目标页面。</p>
    <input type="password" name="password" placeholder="访问密码" required autofocus />
    <button type="submit">继续</button>
    ${error ? `<p class="err">${error}</p>` : ""}
  </form>
</body>
</html>`;
}

async function handleRedirect(
  req: Request,
  slug: string,
  link: {
    id: string;
    userId: string;
    slug: string;
    destination: string;
    iosDestination?: string | null;
    androidDestination?: string | null;
    geoRules?: unknown;
    deviceRules?: unknown;
    active: boolean;
    expiresAt: Date | null;
    startsAt?: Date | null;
    abVariants?: unknown;
    passwordHash: string | null;
  }
) {
  if (!link.active) {
    return NextResponse.redirect(new URL("/", getAppUrl()));
  }
  if (isLinkNotStarted(link.startsAt)) {
    return NextResponse.redirect(new URL("/?scheduled=1", getAppUrl()));
  }
  if (isLinkExpired(link.expiresAt)) {
    return NextResponse.redirect(new URL("/?expired=1", getAppUrl()));
  }

  if (link.passwordHash) {
    const cookieName = `ql_unlock_${slug}`;
    const cookie = req.headers.get("cookie") ?? "";
    const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
    const expected = unlockCookieValue(link.id, link.passwordHash);
    if (!match || match[1] !== expected) {
      return new NextResponse(passwordFormHtml(slug), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  const referrer = req.headers.get("referer");
  const userAgent = req.headers.get("user-agent");
  const country = req.headers.get("x-vercel-ip-country");

  const abPick = resolveLinkDestination(link);
  const targeted = resolveDestination(
    { ...link, destination: abPick.destination },
    { country, userAgent }
  );
  const finalDestination = targeted;

  after(async () => {
    try {
      await recordClick(link.id, {
        referrer,
        userAgent,
        country,
        variantIndex: abPick.variantIndex,
      });
      await dispatchClickWebhooks(link.userId, {
        linkId: link.id,
        slug: link.slug,
        destination: finalDestination,
        country,
        userAgent,
        referrer,
      });
    } catch {
      // Non-blocking click tracking
    }
  });

  return NextResponse.redirect(finalDestination, { status: 302 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(`redirect:${ip}`, 120, 60 * 1000);
  if (!success) return rateLimitResponse();

  const { slug } = await params;
  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link) {
    return NextResponse.redirect(new URL("/", getAppUrl()));
  }

  return handleRedirect(req, slug, link);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(`redirect-pw:${ip}`, 30, 60 * 1000);
  if (!success) return rateLimitResponse();

  const { slug } = await params;
  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link?.passwordHash) {
    return NextResponse.redirect(new URL(`/r/${slug}`, getAppUrl()));
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const valid = await bcrypt.compare(password, link.passwordHash);
  if (!valid) {
    return new NextResponse(passwordFormHtml(slug, "密码错误，请重试"), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const response = await handleRedirect(req, slug, link);
  const token = unlockCookieValue(link.id, link.passwordHash);
  response.cookies.set(`ql_unlock_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: `/r/${slug}`,
  });
  return response;
}