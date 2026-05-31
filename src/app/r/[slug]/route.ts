import { prisma } from "@/lib/db";
import { recordClick } from "@/lib/links";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { after, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(`redirect:${ip}`, 120, 60 * 1000);
  if (!success) return rateLimitResponse();

  const { slug } = await params;
  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link || !link.active) {
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }

  const referrer = req.headers.get("referer");
  const userAgent = req.headers.get("user-agent");
  const country = req.headers.get("x-vercel-ip-country");

  after(async () => {
    try {
      await recordClick(link.id, { referrer, userAgent, country });
    } catch {
      // Non-blocking click tracking
    }
  });

  return NextResponse.redirect(link.destination, { status: 302 });
}
