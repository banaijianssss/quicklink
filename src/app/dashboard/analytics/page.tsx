import { requireSession } from "@/lib/session";
import { getAccountAnalytics } from "@/lib/analytics";
import { getPlanLimits } from "@/lib/plans";
import { AnalyticsChart } from "@/components/analytics-chart";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildShortUrl } from "@/lib/utils";

export default async function AccountAnalyticsPage() {
  const session = await requireSession();
  const limits = getPlanLimits(session.user.plan);

  if (!limits.deepAnalytics) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">账户分析</h1>
        <Card className="p-6 text-sm text-[var(--muted)]">
          深度分析需要 Pro 计划。升级后可查看 24 小时实时点击、设备/OS 分布与 A/B 变体表现。
        </Card>
        <Link href="/pricing">
          <Button>查看升级方案</Button>
        </Link>
      </div>
    );
  }

  const analytics = await getAccountAnalytics(session.user.id, session.user.plan);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">账户分析</h1>
          <p className="text-sm text-[var(--muted)]">最近 {analytics.periodDays} 天汇总</p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary">返回仪表盘</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--muted)]">总点击</p>
          <p className="mt-1 text-3xl font-bold">{analytics.totalClicks}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">24 小时点击</p>
          <p className="mt-1 text-3xl font-bold">{analytics.recentClicks24h}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">活跃链接</p>
          <p className="mt-1 text-3xl font-bold">{analytics.activeLinks}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">每日点击趋势</h2>
        <div className="mt-4">
          <AnalyticsChart data={analytics.chartData} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">热门链接 Top 5</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {analytics.topLinks.length === 0 ? (
            <li className="text-[var(--muted)]">暂无数据</li>
          ) : (
            analytics.topLinks.map((link) => (
              <li key={link.id} className="flex justify-between gap-3">
                <Link href={`/dashboard/links/${link.id}`} className="truncate text-[var(--primary)] hover:underline">
                  {link.title || buildShortUrl(link.slug)}
                </Link>
                <span className="font-medium">{link.clicks}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}