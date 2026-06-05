# QuickLink

可上线盈利的 SaaS MVP：**短链接 + 二维码 + 点击分析**，订阅制收费（Stripe）。

## 功能

- 用户注册 / 登录（邮箱 + 密码，NextAuth v5）
- 创建短链、302 跳转、点击追踪（异步记录，含地区/浏览器分析）
- 二维码 PNG（`/api/qr/[slug]`，需链接所有权）
- 仪表盘与分析页（Recharts）
- **Free**：5 条链接、7 天分析、随机 slug、二维码带水印
- **Starter ($4/月)**：50 条链接、30 天分析、自定义 slug、无水印二维码，7 天免费试用
- **Pro ($9/月)**：1000 条链接、90 天分析、CSV 导出，7 天免费试用
- **Business ($29/月)**：无限链接、365 天分析、REST API 访问（API Key），14 天免费试用
- 年付最高节省 34%（需在 Stripe 创建对应 Price）

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
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) 测试密钥 |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 签名 |
| `STRIPE_STARTER_PRICE_ID` | Starter $4/月 Price ID（`price_...`） |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | Starter $38/年 Price ID（可选） |
| `STRIPE_PRO_PRICE_ID` | Pro $9/月 Price ID |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Pro $79/年 Price ID（可选） |
| `STRIPE_BUSINESS_PRICE_ID` | Business $29/月 Price ID（可选） |
| `STRIPE_BUSINESS_ANNUAL_PRICE_ID` | Business $249/年 Price ID（可选） |

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

1. 在 Stripe 创建 4 个档位的 Price（月付 + 年付各一对）
2. 填入对应 `STRIPE_*_PRICE_ID` 环境变量
3. SEO / Product Hunt / 社群推广
4. 上线后路线图：自定义域名（企业）、团队多账号、邮件周报

## REST API（Business 档）

Business 用户可在设置页生成 API Key，通过以下接口批量管理链接：

```
GET  /api/v1/links              # 列出所有链接（支持 ?page=&limit=）
POST /api/v1/links              # 创建短链 { destination, title?, slug? }
```

请求头：`Authorization: Bearer ql_<your_api_key>`

## 技术栈

Next.js 15 · TypeScript · Tailwind · Prisma · PostgreSQL (Neon) · NextAuth · Stripe
