import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import Link from "next/link";
import { getAppUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "QuickLink — 短链接与点击分析",
    template: "%s | QuickLink",
  },
  description:
    "创建短链接、生成二维码、追踪点击。免费版 5 条链接，Pro 版最多 1000 条链接与 90 天分析。",
  openGraph: {
    title: "QuickLink — 短链接与点击分析",
    description: "创建短链接、生成二维码、追踪点击，Pro 订阅解锁更多链接与高级分析。",
    url: appUrl,
    siteName: "QuickLink",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickLink — 短链接与点击分析",
    description: "创建短链接、生成二维码、追踪点击。",
  },
  alternates: {
    canonical: appUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <footer className="border-t border-[var(--border)] bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 text-sm text-[var(--muted)]">
            <Link href="/pricing" className="hover:text-foreground">定价</Link>
            <Link href="/privacy" className="hover:text-foreground">隐私政策</Link>
            <Link href="/terms" className="hover:text-foreground">服务条款</Link>
            <span>© {new Date().getFullYear()} QuickLink</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
