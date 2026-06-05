import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { parseBrowser } from "@/lib/user-agent";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = getPlanLimits(session.user.plan);
  if (!limits.csvExport) {
    return NextResponse.json(
      { error: "CSV 导出需要 Pro 或 Business 计划" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const link = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const since = new Date();
  since.setDate(since.getDate() - limits.analyticsDays);

  const clicks = await prisma.click.findMany({
    where: { linkId: link.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, referrer: true, country: true, userAgent: true },
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;

  const header = "timestamp,referrer,country,browser\n";
  const rows = clicks
    .map((c) =>
      [
        c.createdAt.toISOString(),
        c.referrer ?? "",
        c.country ?? "",
        parseBrowser(c.userAgent),
      ]
        .map(escape)
        .join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${link.slug}.csv"`,
    },
  });
}
