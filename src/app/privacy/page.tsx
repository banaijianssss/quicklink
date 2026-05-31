import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "QuickLink 隐私政策 — 我们如何收集和使用你的数据。",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <h1>隐私政策</h1>
      <p className="text-[var(--muted)]">最后更新：2026 年 5 月</p>
      <h2>我们收集的信息</h2>
      <ul>
        <li>账户信息：邮箱、姓名（注册时提供）</li>
        <li>链接数据：目标 URL、标题、点击记录（referrer、浏览器、地区）</li>
        <li>支付信息：由 Stripe 处理，我们不存储完整卡号</li>
      </ul>
      <h2>信息用途</h2>
      <p>用于提供短链服务、点击分析、账户管理与订阅计费。</p>
      <h2>数据存储</h2>
      <p>数据存储在 Neon Postgres，部署于 Vercel。点击记录按你的计划保留相应天数。</p>
      <h2>联系我们</h2>
      <p>如有隐私相关问题，请通过 GitHub Issues 联系我们。</p>
    </div>
  );
}
