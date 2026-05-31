import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { buildShortUrl } from "@/lib/utils";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const { success } = await rateLimit(`qr:${ip}`, 30, 60 * 1000);
  if (!success) return rateLimitResponse();

  const { slug } = await params;
  const link = await prisma.link.findFirst({
    where: { slug, userId: session.user.id },
  });

  if (!link || !link.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const shortUrl = buildShortUrl(slug);
  const png = await QRCode.toBuffer(shortUrl, {
    type: "png",
    width: 320,
    margin: 2,
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
