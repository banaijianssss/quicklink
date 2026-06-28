import { prisma } from "@/lib/db";
import { parseBioLinks, recordBioView } from "@/lib/bio";
import { getAppUrl } from "@/lib/utils";
import { after, NextResponse } from "next/server";

const THEMES: Record<string, { bg: string; card: string; accent: string; text: string }> = {
  default: { bg: "#f8fafc", card: "#ffffff", accent: "#2563eb", text: "#0f172a" },
  dark: { bg: "#0f172a", card: "#1e293b", accent: "#38bdf8", text: "#f8fafc" },
  sunset: { bg: "#fff7ed", card: "#ffffff", accent: "#ea580c", text: "#0f172a" },
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = await prisma.bioPage.findUnique({ where: { slug } });
  if (!page || !page.active) {
    return NextResponse.redirect(new URL("/", getAppUrl()));
  }

  const links = parseBioLinks(page.links);
  const theme = THEMES[page.theme] || THEMES.default;
  const userAgent = req.headers.get("user-agent");
  const country = req.headers.get("x-vercel-ip-country");

  after(async () => {
    try {
      await recordBioView(page.id, { userAgent, country });
    } catch {
      // non-blocking
    }
  });

  const linkHtml = links
    .filter((l) => l.active)
    .map(
      (link) =>
        `<a href="${link.url}" target="_blank" rel="noreferrer" style="display:block;padding:12px 16px;border-radius:10px;background:${theme.accent};color:#fff;text-decoration:none;font-weight:600">${link.title}</a>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${page.title || "Link in Bio"}</title></head>
<body style="margin:0;background:${theme.bg};font-family:system-ui,sans-serif">
<main style="max-width:480px;margin:0 auto;padding:32px 16px 48px;text-align:center">
<div style="background:${theme.card};border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(15,23,42,.06)">
${page.avatarUrl ? `<img src="${page.avatarUrl}" alt="" style="width:88px;height:88px;border-radius:50%;object-fit:cover;margin-bottom:12px"/>` : ""}
<h1 style="margin:0 0 8px;font-size:22px;color:${theme.text}">${page.title || "我的链接"}</h1>
${page.bio ? `<p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6">${page.bio}</p>` : ""}
<div style="display:grid;gap:10px">${linkHtml}</div>
</div>
<p style="margin-top:16px;font-size:12px;color:#94a3b8">由 <a href="${getAppUrl()}" style="color:${theme.accent}">QuickLink</a> 提供</p>
</main></body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}