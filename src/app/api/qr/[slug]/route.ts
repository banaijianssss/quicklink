import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import { buildShortUrl } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = await prisma.link.findUnique({ where: { slug } });
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
      "Cache-Control": "public, max-age=86400",
    },
  });
}
