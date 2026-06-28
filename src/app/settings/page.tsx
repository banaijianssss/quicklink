import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlanLimits, PLANS } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/upgrade-button";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { ApiKeySection } from "@/components/api-key-section";
import { DomainsSection } from "@/components/domains-section";
import { WebhooksSection } from "@/components/webhooks-section";
import { TeamSection } from "@/components/team-section";
import { stripeConfigured } from "@/lib/stripe";
import { listTeamForOwner } from "@/lib/team";
import { getAppUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      email: true,
      plan: true,
      apiKey: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  const limits = getPlanLimits(user.plan);
  const planConfig = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.free;

  const [domains, webhooks, teamMembers] = await Promise.all([
    limits.customDomain
      ? prisma.customDomain.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    limits.webhooks
      ? prisma.webhook.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, url: true, active: true, createdAt: true },
        })
      : Promise.resolve([]),
    limits.teamCollaboration
      ? listTeamForOwner(session.user.id)
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">账户设置</h1>

      <Card className="space-y-4">
        <div>
          <p className="text-sm text-[var(--muted)]">邮箱</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">当前计划</p>
          <p className="font-medium capitalize">{planConfig.name}</p>
          {user.stripeCurrentPeriodEnd && user.plan !== "free" && (
            <p className="text-xs text-[var(--muted)] mt-1">
              当前周期至 {user.stripeCurrentPeriodEnd.toLocaleDateString("zh-CN")}
            </p>
          )}
        </div>
        <div className="pt-4 flex flex-wrap gap-3">
          {user.plan === "free" && (
            <UpgradeButton label="升级 Starter — 7天免费试用" plan="starter" />
          )}
          {user.plan === "starter" && (
            <UpgradeButton label="升级到 Pro" plan="pro" />
          )}
          {user.plan === "pro" && (
            <UpgradeButton label="升级到 Business" plan="business" variant="secondary" />
          )}
          {user.stripeCustomerId && stripeConfigured() && <ManageBillingButton />}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-3">当前计划功能</p>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li>最多 {limits.maxLinks === -1 ? "无限" : limits.maxLinks} 条链接</li>
          <li>{limits.analyticsDays} 天点击分析</li>
          <li>{limits.customSlug ? "✓ 自定义 slug" : "✗ 自定义 slug"}</li>
          <li>{limits.csvExport ? "✓ CSV 导出" : "✗ CSV 导出（Pro+）"}</li>
          <li>{limits.apiAccess ? "✓ REST API（Pro+）" : "✗ REST API（Pro+）"}</li>
          <li>{limits.customDomain ? "✓ 自定义域名" : "✗ 自定义域名（Pro+）"}</li>
          <li>{limits.webhooks ? "✓ 点击 Webhook" : "✗ Webhook（Pro+）"}</li>
          <li>{limits.linkFolders ? "✓ 链接文件夹" : "✗ 文件夹（Starter+）"}</li>
          <li>{limits.abTesting ? "✓ A/B 测试" : "✗ A/B 测试（Pro+）"}</li>
          <li>{limits.deepAnalytics ? "✓ 深度分析" : "✗ 深度分析（Pro+）"}</li>
          <li>{limits.teamCollaboration ? "✓ 团队协作" : "✗ 团队（Business）"}</li>
          <li>{limits.bioPages ? "✓ Link-in-bio 页" : "✗ Link-in-bio"}</li>
        </ul>
        <div className="mt-4">
          <Link href="/pricing">
            <Button variant="secondary" className="w-full text-sm">查看升级方案 →</Button>
          </Link>
        </div>
      </Card>

      {limits.apiAccess && <ApiKeySection initialApiKey={user.apiKey} />}
      {limits.customDomain && <DomainsSection initialDomains={domains} />}
      {limits.webhooks && (
        <WebhooksSection
          initialHooks={webhooks.map((h) => ({
            ...h,
            createdAt: h.createdAt.toISOString(),
          }))}
        />
      )}
      {limits.teamCollaboration && (
        <TeamSection
          initialMembers={teamMembers.map((m) => ({
            ...m,
            acceptedAt: m.acceptedAt?.toISOString() ?? null,
          }))}
          appUrl={getAppUrl()}
        />
      )}
    </div>
  );
}