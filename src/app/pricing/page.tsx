import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { UpgradeButton } from "@/components/upgrade-button";
import { PLANS } from "@/lib/plans";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default async function PricingPage() {
  const session = await auth();
  const isPro = session?.user?.plan === "pro";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-center text-3xl font-bold">简单透明的定价</h1>
      <p className="mt-2 text-center text-[var(--muted)]">
        先免费试用，需要更多链接与深度分析时再升级 Pro
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">{PLANS.free.name}</h2>
          <p className="mt-2 text-3xl font-bold">
            $0<span className="text-base font-normal text-[var(--muted)]">/月</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <Feature>最多 {PLANS.free.maxLinks} 条短链</Feature>
            <Feature>{PLANS.free.analyticsDays} 天点击分析</Feature>
            <Feature>二维码下载</Feature>
            <Feature>随机短链 slug</Feature>
          </ul>
          {!session?.user && (
            <Link href="/register" className="mt-8 block">
              <Button variant="secondary" className="w-full">
                注册免费版
              </Button>
            </Link>
          )}
        </Card>
        <Card className="border-[var(--primary)] ring-2 ring-blue-100">
          <p className="text-sm font-medium text-[var(--primary)]">推荐</p>
          <h2 className="text-xl font-bold">{PLANS.pro.name}</h2>
          <p className="mt-2 text-3xl font-bold">
            ${PLANS.pro.price}
            <span className="text-base font-normal text-[var(--muted)]">/月</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <Feature>最多 {PLANS.pro.maxLinks} 条短链</Feature>
            <Feature>{PLANS.pro.analyticsDays} 天点击分析</Feature>
            <Feature>自定义 slug</Feature>
            <Feature>Stripe 订阅管理</Feature>
          </ul>
          <div className="mt-8">
            {session?.user ? (
              isPro ? (
                <p className="text-sm text-green-600 font-medium">你已是 Pro 用户</p>
              ) : (
                <UpgradeButton label="订阅 Pro — $9/月" />
              )
            ) : (
              <Link href="/register">
                <Button className="w-full">注册后升级</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-green-600 shrink-0" />
      {children}
    </li>
  );
}
