import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getLinkAnalytics } from "@/lib/analytics";
import { getPlanLimits } from "@/lib/plans";
import { buildShortUrl } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { CsvExportButton } from "@/components/csv-export-button";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LinkAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const link = await prisma.link.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!link) notFound();

  const analytics = await getLinkAnalytics(link.id, session.user.plan);
  const limits = getPlanLimits(session.user.plan);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-[var(--primary)] hover:underline">
        ← 返回仪表盘
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{link.title || link.slug}</h1>
          <p className="text-[var(--muted)]">{buildShortUrl(link.slug)}</p>
        </div>
        <CsvExportButton linkId={link.id} canExport={limits.csvExport} />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-[var(--muted)]">总点击（{analytics.periodDays} 天内）</p>
          <p className="mt-1 text-3xl font-bold">{analytics.totalClicks}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">日均点击</p>
          <p className="mt-1 text-3xl font-bold">{analytics.avgDaily}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">峰值日</p>
          <p className="mt-1 text-3xl font-bold">{analytics.peakDay.clicks}</p>
          <p className="text-xs text-[var(--muted)]">{analytics.peakDay.date}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">来源数</p>
          <p className="mt-1 text-3xl font-bold">{analytics.topReferrers.length}</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold">每日点击</h2>
        <div className="mt-4">
          <AnalyticsChart data={analytics.chartData} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <h2 className="font-semibold">来源 Top 5</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {analytics.topReferrers.length === 0 ? (
              <li className="text-[var(--muted)]">暂无数据</li>
            ) : (
              analytics.topReferrers.map((r) => (
                <li key={r.referrer} className="flex justify-between gap-4">
                  <span className="truncate">{r.referrer}</span>
                  <span className="font-medium">{r.count}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">浏览器 Top 5</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {analytics.topBrowsers.length === 0 ? (
              <li className="text-[var(--muted)]">暂无数据</li>
            ) : (
              analytics.topBrowsers.map((b) => (
                <li key={b.browser} className="flex justify-between gap-4">
                  <span>{b.browser}</span>
                  <span className="font-medium">{b.count}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">地区 Top 5</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {analytics.topCountries.length === 0 ? (
              <li className="text-[var(--muted)]">暂无数据</li>
            ) : (
              analytics.topCountries.map((c) => (
                <li key={c.country} className="flex justify-between gap-4">
                  <span>{c.country}</span>
                  <span className="font-medium">{c.count}</span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
