import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { parseAbVariants } from "@/lib/ab-test";
import { parseBrowser, parseDevice, parseOs } from "@/lib/user-agent";

type DailyRow = { date: string; count: bigint };
type HourlyRow = { hour: string; count: bigint };
type ReferrerRow = { referrer: string | null; count: bigint };
type BrowserRow = { userAgent: string | null; count: bigint };
type CountryRow = { country: string | null; count: bigint };
type VariantRow = { variantIndex: number | null; count: bigint };

function aggregateUaRows(
  rows: BrowserRow[],
  parser: (ua: string | null) => string
) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = parser(row.userAgent);
    counts.set(name, (counts.get(name) ?? 0) + Number(row.count));
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getLinkAnalytics(
  linkId: string,
  plan: string,
  options?: { abVariants?: unknown }
) {
  const limits = getPlanLimits(plan);
  const since = new Date();
  since.setDate(since.getDate() - limits.analyticsDays);

  const queries: Promise<unknown>[] = [
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
  ];

  if (limits.deepAnalytics) {
    queries.push(
      prisma.$queryRaw<HourlyRow[]>`
        SELECT to_char("createdAt", 'HH24:00') as hour, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw<VariantRow[]>`
        SELECT "variantIndex", COUNT(*)::bigint as count
        FROM "Click"
        WHERE "linkId" = ${linkId} AND "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY count DESC
      `
    );
  }

  const results = await Promise.all(queries);
  const totalResult = results[0] as number;
  const dailyRows = results[1] as DailyRow[];
  const referrerRows = results[2] as ReferrerRow[];
  const browserRows = results[3] as BrowserRow[];
  const countryRows = results[4] as CountryRow[];
  const hourlyRows = limits.deepAnalytics ? (results[5] as HourlyRow[]) : [];
  const variantRows = limits.deepAnalytics ? (results[6] as VariantRow[]) : [];

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

  const abVariants = parseAbVariants(options?.abVariants);
  const abStats = variantRows.map((row) => {
    const idx = row.variantIndex;
    const label =
      idx === null
        ? "默认"
        : abVariants[idx]?.label || `Variant ${(idx ?? 0) + 1}`;
    return { label, variantIndex: idx, count: Number(row.count) };
  });

  return {
    totalClicks: totalResult,
    chartData,
    hourlyData: hourlyRows.map((row) => ({
      hour: row.hour,
      clicks: Number(row.count),
    })),
    topReferrers: referrerRows.map((r) => ({
      referrer: r.referrer ?? "Direct",
      count: Number(r.count),
    })),
    topBrowsers,
    topDevices: limits.deepAnalytics
      ? aggregateUaRows(browserRows, parseDevice)
      : [],
    topOs: limits.deepAnalytics ? aggregateUaRows(browserRows, parseOs) : [],
    topCountries: countryRows.map((c) => ({
      country: c.country ?? "Unknown",
      count: Number(c.count),
    })),
    abStats,
    peakDay,
    avgDaily:
      chartData.length > 0
        ? Math.round(totalResult / chartData.length)
        : 0,
    periodDays: limits.analyticsDays,
    deepAnalytics: limits.deepAnalytics,
  };
}

export async function getAccountAnalytics(userId: string, plan: string) {
  const limits = getPlanLimits(plan);
  const since = new Date();
  since.setDate(since.getDate() - limits.analyticsDays);

  const [totalClicks, activeLinks, dailyRows, recentClicks] = await Promise.all([
    prisma.click.count({
      where: { link: { userId }, createdAt: { gte: since } },
    }),
    prisma.link.count({ where: { userId, active: true } }),
    prisma.$queryRaw<DailyRow[]>`
      SELECT to_char(c."createdAt", 'YYYY-MM-DD') as date, COUNT(*)::bigint as count
      FROM "Click" c
      JOIN "Link" l ON l.id = c."linkId"
      WHERE l."userId" = ${userId} AND c."createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.click.count({
      where: {
        link: { userId },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const topLinks = await prisma.link.findMany({
    where: { userId },
    orderBy: { clicks: { _count: "desc" } },
    take: 5,
    select: {
      id: true,
      slug: true,
      title: true,
      _count: { select: { clicks: true } },
    },
  });

  return {
    totalClicks,
    activeLinks,
    recentClicks24h: recentClicks,
    chartData: dailyRows.map((row) => ({
      date: row.date,
      clicks: Number(row.count),
    })),
    topLinks: topLinks.map((link) => ({
      id: link.id,
      slug: link.slug,
      title: link.title,
      clicks: link._count.clicks,
    })),
    periodDays: limits.analyticsDays,
    deepAnalytics: limits.deepAnalytics,
  };
}
