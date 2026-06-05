import type { Metadata } from "next";
import { auth } from "@/auth";
import { PLANS } from "@/lib/plans";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { PricingToggle } from "@/components/pricing-toggle";

export const metadata: Metadata = {
  title: "定价",
  description: "QuickLink 定价：Free 永久免费，Starter $4/月，Pro $9/月，Business $29/月。年付最高节省 34%。",
};

export default async function PricingPage() {
  const session = await auth();
  const currentPlan = session?.user?.plan ?? "free";

  const plans = [
    {
      ...PLANS.free,
      features: [
        { text: `最多 ${PLANS.free.maxLinks} 条短链`, included: true },
        { text: `${PLANS.free.analyticsDays} 天点击分析`, included: true },
        { text: "二维码下载（带水印）", included: true },
        { text: "随机短链 slug", included: true },
        { text: "自定义 slug", included: false },
        { text: "CSV 数据导出", included: false },
        { text: "API 访问", included: false },
      ],
    },
    {
      ...PLANS.starter,
      features: [
        { text: `最多 ${PLANS.starter.maxLinks} 条短链`, included: true },
        { text: `${PLANS.starter.analyticsDays} 天点击分析`, included: true },
        { text: "二维码下载（无水印）", included: true },
        { text: "自定义 slug", included: true },
        { text: "7 天免费试用", included: true },
        { text: "CSV 数据导出", included: false },
        { text: "API 访问", included: false },
      ],
    },
    {
      ...PLANS.pro,
      features: [
        { text: `最多 ${PLANS.pro.maxLinks} 条短链`, included: true },
        { text: `${PLANS.pro.analyticsDays} 天点击分析`, included: true },
        { text: "二维码下载（无水印）", included: true },
        { text: "自定义 slug", included: true },
        { text: "CSV 数据导出", included: true },
        { text: "7 天免费试用", included: true },
        { text: "API 访问", included: false },
      ],
    },
    {
      ...PLANS.business,
      features: [
        { text: "无限短链", included: true },
        { text: `${PLANS.business.analyticsDays} 天点击分析`, included: true },
        { text: "二维码下载（无水印）", included: true },
        { text: "自定义 slug", included: true },
        { text: "CSV 数据导出", included: true },
        { text: "API 访问（含 API Key）", included: true },
        { text: "14 天免费试用", included: true },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">简单透明的定价</h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          无隐藏费用 · 随时取消 · 付费档含免费试用
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
          <Zap className="h-4 w-4" />
          年付最高节省 34%
        </div>
      </div>

      <PricingToggle plans={plans} currentPlan={currentPlan} isLoggedIn={!!session?.user} />

      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold">常见问题</h2>
        <div className="mt-8 mx-auto max-w-3xl grid gap-4 text-left sm:grid-cols-2">
          {[
            {
              q: "可以随时取消吗？",
              a: "可以，在账户设置中通过 Stripe 客户门户取消，不收违约金。",
            },
            {
              q: "免费试用需要填写信用卡吗？",
              a: "是的，Stripe 会预授权但试用期内不扣款，试用结束前可随时取消。",
            },
            {
              q: "年付和月付有什么区别？",
              a: "年付一次性结算全年费用，Starter 省 $10、Pro 省 $29、Business 省 $99。",
            },
            {
              q: "Business API 是什么？",
              a: "Business 用户可获得 API Key，通过 REST API 批量创建和管理短链，适合开发者集成。",
            },
            {
              q: "降级后数据会丢失吗？",
              a: "不会，超出免费版上限的链接会暂停但不删除，续费后自动恢复。",
            },
            {
              q: "支持哪些支付方式？",
              a: "通过 Stripe 支持信用卡、借记卡及部分地区的本地支付方式。",
            },
          ].map(({ q, a }) => (
            <Card key={q}>
              <h3 className="font-semibold text-sm">{q}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{a}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-[var(--primary)] p-8 text-center text-white">
        <h2 className="text-2xl font-bold">准备好开始了吗？</h2>
        <p className="mt-2 text-blue-100">免费版永久可用，付费版含免费试用期，无风险体验。</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {!session?.user ? (
            <>
              <Link href="/register">
                <Button className="bg-white text-[var(--primary)] hover:bg-blue-50 px-8">
                  免费注册
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-8">
                  试用 Pro — 7 天免费
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-white text-[var(--primary)] hover:bg-blue-50 px-8">
                进入仪表盘
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

