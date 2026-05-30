import { prisma } from "@/lib/db";
import { recordClick } from "@/lib/links";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = await prisma.link.findUnique({ where: { slug } });

  if (!link || !link.active) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const referrer = req.headers.get("referer");
  const userAgent = req.headers.get("user-agent");

  await recordClick(link.id, { referrer, userAgent });

  return NextResponse.redirect(link.destination, { status: 302 });
}
