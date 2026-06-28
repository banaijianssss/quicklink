import { auth } from "@/auth";
import { createBioPageForUser, parseBioLinks } from "@/lib/bio";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.bioPage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { views: true } } },
  });
  return NextResponse.json({ data: pages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await createBioPageForUser({
    userId: session.user.id,
    plan: session.user.plan,
    slug: String(body.slug || ""),
    title: body.title ? String(body.title) : undefined,
    bio: body.bio ? String(body.bio) : undefined,
    avatarUrl: body.avatarUrl ? String(body.avatarUrl) : undefined,
    theme: body.theme ? String(body.theme) : undefined,
    links: parseBioLinks(body.links),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ page: result.page }, { status: 201 });
}