export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    maxLinks: 5,
    analyticsDays: 7,
    customSlug: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9,
    maxLinks: 1000,
    analyticsDays: 90,
    customSlug: true,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
  return plan === "pro" ? PLANS.pro : PLANS.free;
}

export function isPro(plan: string) {
  return plan === "pro";
}
