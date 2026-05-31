# QuickLink

可上线盈利的 SaaS MVP：**短链接 + 二维码 + 点击分析**，订阅制收费（Stripe）。

## 功能

- 用户注册 / 登录（邮箱 + 密码，NextAuth v5）
- 创建短链、302 跳转、点击追踪（异步记录，含地区/浏览器分析）
- 二维码 PNG（`/api/qr/[slug]`，需链接所有权）
- 仪表盘与分析页（Recharts）
- **Free**：5 条链接、7 天分析、随机 slug
- **Pro ($9/月)**：1000 条链接、90 天分析、自定义 slug（Stripe Checkout + Webhook）

## 本地开发

```bash
npm install
cp .env.example .env
# 填入 Neon Postgres 连接串与 AUTH_SECRET
npm run db:migrate
npm run dev
```

打开 http://localhost:3000

## 环境变量

| 变量 | 说明 |
|------|------|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | 本地 `http://localhost:3000`；生产为站点 URL |
| `DATABASE_URL` | Neon Postgres 连接串 |
| `NEXT_PUBLIC_APP_URL` | 站点 URL |
| `STRIPE_*` | [Stripe Dashboard](https://dashboard.stripe.com) 测试密钥 |
| `STRIPE_PRO_PRICE_ID` | 创建 $9/月 recurring Price 后的 `price_...` |

### Stripe Webhook（本地）

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

将输出的 `whsec_...` 写入 `STRIPE_WEBHOOK_SECRET`。

## 测试

```bash
npm test
npm run build
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. [Vercel](https://vercel.com) 导入项目
3. 在 Marketplace 添加 **Neon Postgres**，设置 `DATABASE_URL`
4. 配置所有 `.env.example` 中的变量（生产 Stripe 密钥）
5. 在 Stripe 配置 Webhook：`https://你的域名/api/webhooks/stripe`
6. Deploy（构建时自动 `prisma migrate deploy`）

## 盈利路径

1. 上线落地页 + 定价页
2. 配置 Stripe 真实 Price（$9/月）
3. SEO / 产品 Hunt / 社群推广
4. 按用量扩展：团队版、自定义域名、API 访问（roadmap）

## 技术栈

Next.js 15 · TypeScript · Tailwind · Prisma · PostgreSQL (Neon) · NextAuth · Stripe
