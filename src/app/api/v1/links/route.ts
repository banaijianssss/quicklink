import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { createLinkForUser } from "@/lib/links";
import { NextResponse } from "next/server";

async function authenticateApiKey(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ql_")) {
    return null;
  }
  const apiKey = authHeader.slice(7);
  const user = await prisma.user.findUnique({
    where: { apiKey },
    select: { id: true, plan: true, email: true },
  });
  if (!user) return null;
  const limits = getPlanLimits(user.plan);
  if (!limits.apiAccess) return null;
  return user;
}

/**
 * GET /api/v1/links — list all links for the authenticated user
 * Header: Authorization: Bearer ql_<api_key>
 */
export async function GET(req: Request) {
  const user = await authenticateApiKey(req);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Business plan required." },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { _count: { select: { clicks: true } } },
    }),
    prisma.link.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    data: links.map((l) => ({
      id: l.id,
      slug: l.slug,
      destination: l.destination,
      title: l.title,
      active: l.active,
      clicks: l._count.clicks,
      createdAt: l.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/**
 * POST /api/v1/links — create a new link
 * Header: Authorization: Bearer ql_<api_key>
 * Body: { destination: string, title?: string, slug?: string }
 */
export async function POST(req: Request) {
  const user = await authenticateApiKey(req);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Business plan required." },
      { status: 401 }
    );
  }

  let body: { destination?: string; title?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  const result = await createLinkForUser({
    userId: user.id,
    plan: user.plan,
    destination: body.destination,
    title: body.title,
    customSlug: body.slug,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    {
      id: result.link.id,
      slug: result.link.slug,
      destination: result.link.destination,
      title: result.link.title,
      active: result.link.active,
      createdAt: result.link.createdAt,
    },
    { status: 201 }
  );
}
