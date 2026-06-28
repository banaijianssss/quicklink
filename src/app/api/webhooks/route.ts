import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { generateWebhookSecret } from "@/lib/webhooks";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, events: true, active: true, createdAt: true },
  });
  return NextResponse.json({ data: hooks });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = getPlanLimits(session.user.plan);
  if (!limits.webhooks) {
    return NextResponse.json({ error: "Webhooks require Pro plan" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const url = String(body.url || "").trim();
  if (!url.startsWith("https://")) {
    return NextResponse.json({ error: "Webhook URL must be HTTPS" }, { status: 400 });
  }

  const hook = await prisma.webhook.create({
    data: {
      userId: session.user.id,
      url,
      secret: generateWebhookSecret(),
      events: ["click"],
    },
  });

  return NextResponse.json({ webhook: hook }, { status: 201 });
}