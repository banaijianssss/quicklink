import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getPlanLimits, PLANS } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/upgrade-button";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { ApiKeySection } from "@/components/api-key-section";
import { stripeConfigured } from "@/lib/stripe";
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

  return (
    <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">账户设置</h1>

      {/* Account Info */}
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
            <UpgradeButton label="升级到 Business（含 API）" plan="business" variant="secondary" />
          )}
          {user.stripeCustomerId && stripeConfigured() && (
            <ManageBillingButton />
          )}
        </div>
        {!stripeConfigured() && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
            Stripe 未配置：在 .env 中填入真实 STRIPE_* 密钥后即可收款。
          </p>
        )}
      </Card>

      {/* Plan Features Summary */}
      <Card>
        <p className="text-sm font-semibold mb-3">当前计划功能</p>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li>最多 {limits.maxLinks === -1 ? "无限" : limits.maxLinks} 条链接</li>
          <li>{limits.analyticsDays} 天点击分析</li>
          <li>{limits.customSlug ? "✓ 自定义 slug" : "✗ 自定义 slug（需升级）"}</li>
          <li>{limits.csvExport ? "✓ CSV 数据导出" : "✗ CSV 导出（Pro+ 功能）"}</li>
          <li>{limits.qrWatermark ? "✗ 二维码带水印（付费版可去除）" : "✓ 二维码无水印"}</li>
          <li>{limits.apiAccess ? "✓ API 访问" : "✗ API 访问（Business 功能）"}</li>
        </ul>
        {user.plan !== "business" && (
          <div className="mt-4">
            <Link href="/pricing">
              <Button variant="secondary" className="w-full text-sm">
                查看升级方案 →
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* API Key Section — Business only */}
      {limits.apiAccess && (
        <ApiKeySection initialApiKey={user.apiKey} />
      )}
    </div>
  );
}
