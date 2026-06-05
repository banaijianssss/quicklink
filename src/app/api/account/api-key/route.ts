import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function generateApiKey(): string {
  return `ql_${randomBytes(24).toString("hex")}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = getPlanLimits(session.user.plan);
  if (!limits.apiAccess) {
    return NextResponse.json({ error: "API access requires Business plan" }, { status: 403 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { apiKey: true },
  });

  return NextResponse.json({ apiKey: user.apiKey });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = getPlanLimits(session.user.plan);
  if (!limits.apiAccess) {
    return NextResponse.json({ error: "API access requires Business plan" }, { status: 403 });
  }

  const apiKey = generateApiKey();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey },
  });

  return NextResponse.json({ apiKey });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey: null },
  });

  return NextResponse.json({ success: true });
}
