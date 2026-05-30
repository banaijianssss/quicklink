import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

export async function getLinkAnalytics(linkId: string, plan: string) {
  const limits = getPlanLimits(plan);
  const since = new Date();
  since.setDate(since.getDate() - limits.analyticsDays);

  const clicks = await prisma.click.findMany({
    where: { linkId, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, referrer: true },
  });

  const byDay = new Map<string, number>();
  for (const click of clicks) {
    const day = click.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const chartData = Array.from(byDay.entries()).map(([date, count]) => ({
    date,
    clicks: count,
  }));

  const referrerCounts = new Map<string, number>();
  for (const click of clicks) {
    const ref = click.referrer || "Direct";
    referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
  }

  const topReferrers = Array.from(referrerCounts.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalClicks: clicks.length,
    chartData,
    topReferrers,
    periodDays: limits.analyticsDays,
  };
}
