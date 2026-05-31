import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2, BarChart3, QrCode, Zap } from "lucide-react";
import { PLANS } from "@/lib/plans";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm text-[var(--primary)]">
          SaaS · 短链接 · 可上线盈利
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          短链接、二维码与点击分析
          <br />
          <span className="text-[var(--primary)]">一站搞定</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
          QuickLink 帮你把长 URL 变成可追踪的短链，生成二维码，查看谁在点击、从哪来。
          免费版 {PLANS.free.maxLinks} 条链接，Pro 版 ${PLANS.pro.price}/月最多 {PLANS.pro.maxLinks} 条链接与 {PLANS.pro.analyticsDays} 天分析。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button className="px-8 py-3 text-base">免费开始</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" className="px-8 py-3 text-base">
              查看定价
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Link2, title: "短链接", desc: "一键生成，支持自定义 slug（Pro）" },
            { icon: QrCode, title: "二维码", desc: "每条链接自动生成 PNG 二维码" },
            { icon: BarChart3, title: "点击分析", desc: "按日统计、来源、浏览器与地区" },
            { icon: Zap, title: "Stripe 订阅", desc: "Pro 计划自动开通与权限控制" },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="text-center">
              <Icon className="mx-auto h-8 w-8 text-[var(--primary)]" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold">常见问题</h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "免费版有什么限制？",
              a: `免费版最多 ${PLANS.free.maxLinks} 条链接，${PLANS.free.analyticsDays} 天点击分析，使用随机 slug。`,
            },
            {
              q: "Pro 版包含什么？",
              a: `Pro 版 $${PLANS.pro.price}/月，最多 ${PLANS.pro.maxLinks} 条链接、${PLANS.pro.analyticsDays} 天分析，支持自定义 slug。`,
            },
            {
              q: "可以随时取消订阅吗？",
              a: "可以，在账户设置中通过 Stripe 客户门户管理或取消订阅。",
            },
          ].map(({ q, a }) => (
            <Card key={q}>
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
