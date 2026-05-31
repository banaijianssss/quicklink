import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款",
  description: "QuickLink 服务条款 — 使用本服务的规则与限制。",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <h1>服务条款</h1>
      <p className="text-[var(--muted)]">最后更新：2026 年 5 月</p>
      <h2>服务说明</h2>
      <p>
        QuickLink 提供短链接创建、二维码生成与点击分析服务。免费版与 Pro 版功能限制见定价页。
      </p>
      <h2>用户责任</h2>
      <ul>
        <li>不得创建指向恶意软件、钓鱼、违法内容的短链</li>
        <li>不得滥用服务（刷量、自动化攻击等）</li>
        <li>你对自己创建的链接内容负责</li>
      </ul>
      <h2>订阅与退款</h2>
      <p>
        Pro 订阅通过 Stripe 计费，可随时在账户设置中取消。取消后当前计费周期结束前仍可使用 Pro 功能。
      </p>
      <h2>服务变更</h2>
      <p>我们保留修改或终止服务的权利，重大变更将提前通知用户。</p>
    </div>
  );
}
