import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { parseBrowser } from "@/lib/user-agent";

type DailyRow = { date: string; count: bigint };
type ReferrerRow = { referrer: string | null; count: bigint };
type BrowserRow = { userAgent: string | null; count: bigint };
type CountryRow = { country: string | null; count: bigint };

export async function getLinkAnalytics(linkId: string, plan: string) {
  const limits = getPlanLimits(plan);
  const since = new Date();
  since.setDate(since.getDate() - limits.analyticsDays);

  const [totalResult, dailyRows, referrerRows, browserRows, countryRows] =
    await Promise.all([
      prisma.click.count({ where: { linkId, createdAt: { gte: since } } }),
      prisma.$queryRaw<DailyRow[]>`
        SELECT to_char("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw<ReferrerRow[]>`
        SELECT COALESCE(NULLIF(referrer, ''), 'Direct') as referrer, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 5
      `,
      prisma.$queryRaw<BrowserRow[]>`
        SELECT "userAgent", COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 50
      `,
      prisma.$queryRaw<CountryRow[]>`
        SELECT COALESCE(NULLIF(country, ''), 'Unknown') as country, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

  const chartData = dailyRows.map((row) => ({
    date: row.date,
    clicks: Number(row.count),
  }));

  const peakDay = chartData.reduce(
    (best, row) => (row.clicks > best.clicks ? row : best),
    { date: "—", clicks: 0 }
  );

  const browserCounts = new Map<string, number>();
  for (const row of browserRows) {
    const name = parseBrowser(row.userAgent);
    browserCounts.set(name, (browserCounts.get(name) ?? 0) + Number(row.count));
  }

  const topBrowsers = Array.from(browserCounts.entries())
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalClicks: totalResult,
    chartData,
    topReferrers: referrerRows.map((r) => ({
      referrer: r.referrer ?? "Direct",
      count: Number(r.count),
    })),
    topBrowsers,
    topCountries: countryRows.map((c) => ({
      country: c.country ?? "Unknown",
      count: Number(c.count),
    })),
    peakDay,
    avgDaily:
      chartData.length > 0
        ? Math.round(totalResult / chartData.length)
        : 0,
    periodDays: limits.analyticsDays,
  };
}
