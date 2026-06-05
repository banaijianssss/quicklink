import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
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
  const limits = getPlanLimits(session.user.plan);

  if (limits.qrWatermark) {
    // Free plan: return watermarked SVG
    const qrSize = 280;
    const footerHeight = 28;
    const totalHeight = qrSize + footerHeight;

    const svgString = await QRCode.toString(shortUrl, {
      type: "svg",
      width: qrSize,
      margin: 2,
    });

    // Strip the outer <svg> tag and extract viewBox/content
    const innerContent = svgString
      .replace(/<\?xml[^?]*\?>\s*/i, "")
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "");

    const watermarkedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${qrSize}" height="${totalHeight}" viewBox="0 0 ${qrSize} ${totalHeight}">
  <rect width="${qrSize}" height="${totalHeight}" fill="white"/>
  <g>${innerContent}</g>
  <rect x="0" y="${qrSize}" width="${qrSize}" height="${footerHeight}" fill="#f0f4ff"/>
  <text x="${qrSize / 2}" y="${qrSize + 19}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#2563eb" font-weight="500">由 QuickLink.app 生成 · 升级移除水印</text>
</svg>`;

    return new NextResponse(watermarkedSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "private, no-store",
      },
    });
  }

  // Paid plans: clean high-quality PNG
  const png = await QRCode.toBuffer(shortUrl, {
    type: "png",
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
