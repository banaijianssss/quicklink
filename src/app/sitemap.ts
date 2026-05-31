import { getAppUrl } from "@/lib/utils";

export default function sitemap() {
  const base = getAppUrl();
  const routes = ["", "/pricing", "/login", "/register", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
