import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Link2,
  BarChart3,
  QrCode,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { PLANS } from "@/lib/plans";

const STATS = [
  { value: "10,000+", label: "活跃短链接" },
  { value: "500万+", label: "月均点击追踪" },
  { value: "99.9%", label: "服务可用率" },
  { value: "<50ms", label: "平均跳转延迟" },
];

const FEATURES = [
  {
    icon: Link2,
    title: "一键短链",
    desc: "粘贴长 URL，秒变短链。Pro 用户可自定义 slug，打造专属品牌链接。",
  },
  {
    icon: QrCode,
    title: "二维码生成",
    desc: "每条链接自动生成专属二维码。Pro 用户下载无水印高清版，轻松印刷物料。",
  },
  {
    icon: BarChart3,
    title: "深度点击分析",
    desc: "实时统计点击数、来源、地区与浏览器分布。Pro 用户可导出 CSV 做深度分析。",
  },
  {
    icon: Globe,
    title: "全球加速跳转",
    desc: "部署于全球边缘网络，平均跳转延迟低于 50ms，保障用户体验。",
  },
  {
    icon: Shield,
    title: "安全可靠",
    desc: "自动过滤恶意 URL，HTTPS 加密传输，Stripe 处理支付，数据零泄漏风险。",
  },
  {
    icon: TrendingUp,
    title: "增长工具",
    desc: "通过来源追踪了解哪个渠道带来最多流量，优化营销投放，提升 ROI。",
  },
];

const TESTIMONIALS = [
  {
    name: "李明",
    role: "内容创作者",
    text: "用 QuickLink 管理所有推广链接，7 天分析让我知道哪条内容效果最好，Pro 版非常值！",
  },
  {
    name: "张小雨",
    role: "电商运营",
    text: "自定义 slug 让链接看起来更专业，客户点击率提升了 23%。CSV 导出功能配合我们的数据团队完美。",
  },
  {
    name: "王伟",
    role: "独立开发者",
    text: "Business 版 API 直接集成进我的应用，批量创建短链轻而易举，价格也很合理。",
  },
];

const FAQ = [
  {
    q: "免费版有什么限制？",
    a: `免费版最多 ${PLANS.free.maxLinks} 条链接，${PLANS.free.analyticsDays} 天分析，二维码带水印，使用随机 slug。永久免费，无需信用卡。`,
  },
  {
    q: "Starter 和 Pro 有什么区别？",
    a: `Starter $4/月，适合个人用户：50 条链接、30 天分析、自定义 slug、无水印二维码。Pro $9/月，适合营销团队：1000 条链接、90 天分析、CSV 导出。`,
  },
  {
    q: "试用期结束后会自动扣款吗？",
    a: "是的，试用结束后自动续费。你可以在试用期内随时通过 Stripe 门户取消，不会产生任何费用。",
  },
  {
    q: "可以随时取消订阅吗？",
    a: "可以，无违约金，无需理由。取消后当前计费周期内仍可继续使用。",
  },
  {
    q: "Business API 怎么使用？",
    a: "订阅 Business 后在设置页获取 API Key，通过 REST API 可批量创建短链、查询分析数据，文档见账户设置。",
  },
  {
    q: "年付和月付怎么选？",
    a: "年付 Starter 省 $10、Pro 省 $29、Business 省 $99，适合长期用户。月付灵活，随时升降级。",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <Link href="/pricing" className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-[var(--primary)] hover:bg-blue-100 transition-colors">
          <Zap className="h-3.5 w-3.5" />
          新功能：Business API · 年付省 34%
          <ArrowRight className="h-3 w-3" />
        </Link>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl leading-tight">
          把每一个链接
          <br />
          <span className="text-[var(--primary)]">变成增长引擎</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
          QuickLink 让你的链接可追踪、可品牌化、可分析。从内容创作者到企业营销团队，
          一个工具搞定短链、二维码与深度点击数据。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button className="px-8 py-3 text-base">
              免费开始使用
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" className="px-8 py-3 text-base">
              查看定价方案
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">
          无需信用卡 · 付费档含免费试用 · 随时取消
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)] bg-blue-50/50 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-[var(--primary)]">{value}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-[var(--border)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            一个平台，覆盖你所有的链接需求
          </h2>
          <p className="mt-3 text-center text-[var(--muted)]">
            从创建到追踪，每一步都为转化率而设计
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">从免费开始，按需扩展</h2>
          <p className="mt-3 text-[var(--muted)]">
            四个定价档位，从个人用户到企业团队全覆盖
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-4 text-left">
            {[
              { name: "Free", price: "$0", highlight: "5 条链接", color: "bg-gray-50" },
              { name: "Starter", price: "$4/月", highlight: "50 条链接", color: "bg-blue-50", trial: "7天试用" },
              { name: "Pro", price: "$9/月", highlight: "1000 条链接 + CSV", color: "bg-blue-100", trial: "7天试用", popular: true },
              { name: "Business", price: "$29/月", highlight: "无限链接 + API", color: "bg-blue-50", trial: "14天试用" },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl ${plan.color} p-4 relative`}>
                {plan.popular && (
                  <span className="absolute -top-2 left-4 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-semibold text-white">
                    最受欢迎
                  </span>
                )}
                <p className="font-bold">{plan.name}</p>
                <p className="mt-1 text-lg font-bold text-[var(--primary)]">{plan.price}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{plan.highlight}</p>
                {plan.trial && (
                  <p className="mt-2 text-xs text-green-600 font-medium">✓ {plan.trial}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/pricing">
              <Button variant="secondary" className="px-8">
                查看完整功能对比
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[var(--border)] bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">用户怎么说</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <Card key={name}>
                <p className="text-sm text-[var(--muted)] leading-relaxed">&ldquo;{text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-[var(--muted)]">{role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-center text-2xl font-bold">常见问题</h2>
        <div className="mt-8 space-y-4">
          {FAQ.map(({ q, a }) => (
            <Card key={q}>
              <h3 className="font-semibold text-sm">{q}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[var(--primary)] py-16 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">立刻开始追踪你的链接</h2>
        <p className="mt-3 text-blue-100">免费版永久可用，付费档 7 天免费试用，随时取消。</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button className="bg-white text-[var(--primary)] hover:bg-blue-50 px-10 py-3 text-base">
              免费注册
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-10 py-3 text-base">
              查看定价
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
