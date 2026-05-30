import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/upgrade-button";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { stripeConfigured } from "@/lib/stripe";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">账户设置</h1>
      <Card className="mt-8 space-y-4">
        <div>
          <p className="text-sm text-[var(--muted)]">邮箱</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--muted)]">当前计划</p>
          <p className="font-medium capitalize">{user.plan}</p>
          {user.stripeCurrentPeriodEnd && user.plan === "pro" && (
            <p className="text-xs text-[var(--muted)] mt-1">
              当前周期至 {user.stripeCurrentPeriodEnd.toLocaleDateString("zh-CN")}
            </p>
          )}
        </div>
        <div className="pt-4 flex flex-wrap gap-3">
          {user.plan !== "pro" && <UpgradeButton />}
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
    </div>
  );
}
