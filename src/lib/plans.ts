export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    annualPrice: 0,
    maxLinks: 5,
    analyticsDays: 7,
    customSlug: false,
    csvExport: false,
    qrWatermark: true,
    apiAccess: false,
    trialDays: 0,
    description: "个人体验，永久免费",
    badge: null as string | null,
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 4,
    annualPrice: 38,
    maxLinks: 50,
    analyticsDays: 30,
    customSlug: true,
    csvExport: false,
    qrWatermark: false,
    apiAccess: false,
    trialDays: 7,
    description: "个人创作者与小团队",
    badge: "7天免费试用" as string | null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9,
    annualPrice: 79,
    maxLinks: 1000,
    analyticsDays: 90,
    customSlug: true,
    csvExport: true,
    qrWatermark: false,
    apiAccess: false,
    trialDays: 7,
    description: "专业用户与营销团队",
    badge: "最受欢迎" as string | null,
  },
  business: {
    id: "business",
    name: "Business",
    price: 29,
    annualPrice: 249,
    maxLinks: -1,
    analyticsDays: 365,
    customSlug: true,
    csvExport: true,
    qrWatermark: false,
    apiAccess: true,
    trialDays: 14,
    description: "企业与高流量场景",
    badge: null as string | null,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
  if (plan === "starter") return PLANS.starter;
  if (plan === "pro") return PLANS.pro;
  if (plan === "business") return PLANS.business;
  return PLANS.free;
}

export function isPro(plan: string) {
  return plan === "pro" || plan === "business" || plan === "starter";
}

export function isPaidPlan(plan: string) {
  return plan !== "free";
}

export function planFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_STARTER_PRICE_ID ?? "__none__"]: "starter",
    [process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? "__none__"]: "starter",
    [process.env.STRIPE_PRO_PRICE_ID ?? "__none__"]: "pro",
    [process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "__none__"]: "pro",
    [process.env.STRIPE_BUSINESS_PRICE_ID ?? "__none__"]: "business",
    [process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID ?? "__none__"]: "business",
  };
  return map[priceId] ?? "pro";
}
