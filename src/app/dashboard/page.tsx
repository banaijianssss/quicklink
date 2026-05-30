import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { countUserLinks } from "@/lib/links";
import { getPlanLimits } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { CreateLinkForm } from "@/components/create-link-form";
import { LinkRow } from "@/components/link-row";
import { UpgradeButton } from "@/components/upgrade-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const plan = session.user.plan;
  const limits = getPlanLimits(plan);
  const linkCount = await countUserLinks(session.user.id);

  const links = await prisma.link.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clicks: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {params.upgraded === "1" && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          感谢订阅！若计划未立即更新，请稍候或刷新页面（Webhook 同步）。
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
        <h2 className="mb-4 font-semibold">我的链接 ({links.length})</h2>
        {links.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">还没有链接，在上方创建第一条吧。</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <LinkRow key={link.id} link={link} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
