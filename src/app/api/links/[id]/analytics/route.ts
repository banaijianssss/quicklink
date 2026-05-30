import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getLinkAnalytics } from "@/lib/analytics";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const link = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const analytics = await getLinkAnalytics(link.id, session.user.plan);
  return NextResponse.json(analytics);
}
