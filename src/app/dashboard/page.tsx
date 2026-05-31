import { requireSession } from "@/lib/session";
import { countUserLinks, getUserLinksPage } from "@/lib/links";
import { getPlanLimits } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { CreateLinkForm } from "@/components/create-link-form";
import { LinkRow } from "@/components/link-row";
import { UpgradeButton } from "@/components/upgrade-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; page?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const plan = session.user.plan;
  const limits = getPlanLimits(plan);
  const linkCount = await countUserLinks(session.user.id);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { links, total, totalPages } = await getUserLinksPage(session.user.id, page);
  const overLimit = plan === "free" && linkCount > limits.maxLinks;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {params.upgraded === "1" && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          感谢订阅！若计划未立即更新，请稍候或刷新页面（Webhook 同步）。
        </div>
      )}
      {overLimit && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          你的链接数已超过免费版上限。请删除多余链接或续订 Pro 以继续创建新链接。
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">仪表盘</h1>
          <p className="text-[var(--muted)]">
            计划：<span className="font-medium capitalize">{plan}</span> · 已用{" "}
            {linkCount}/{limits.maxLinks} 条链接
          </p>
        </div>
        {plan !== "pro" && <UpgradeButton />}
      </div>

      <Card className="mt-8">
        <h2 className="font-semibold">新建短链</h2>
        <div className="mt-4">
          <CreateLinkForm plan={plan} />
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="mb-4 font-semibold">我的链接 ({total})</h2>
        {links.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">还没有链接，在上方创建第一条吧。</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <LinkRow key={link.id} link={link} plan={plan} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link href={`/dashboard?page=${page - 1}`}>
                <Button variant="secondary">上一页</Button>
              </Link>
            )}
            <span className="text-sm text-[var(--muted)]">
              第 {page} / {totalPages} 页
            </span>
            {page < totalPages && (
              <Link href={`/dashboard?page=${page + 1}`}>
                <Button variant="secondary">下一页</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
