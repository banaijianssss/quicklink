import { getAppUrl } from "@/lib/utils";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/settings", "/api/"],
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
