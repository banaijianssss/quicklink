import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { planFromPriceId } from "@/lib/plans";

export const stripe =
  process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export function stripeConfigured() {
  return Boolean(
    stripe &&
    (process.env.STRIPE_PRO_PRICE_ID?.startsWith("price_") ||
      process.env.STRIPE_STARTER_PRICE_ID?.startsWith("price_") ||
      process.env.STRIPE_BUSINESS_PRICE_ID?.startsWith("price_"))
  );
}

export function getPriceId(planId: string, billing: "monthly" | "annual"): string | null {
  if (billing === "annual") {
    if (planId === "starter") return process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? null;
    if (planId === "pro") return process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null;
    if (planId === "business") return process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID ?? null;
  }
  if (planId === "starter") return process.env.STRIPE_STARTER_PRICE_ID ?? null;
  if (planId === "pro") return process.env.STRIPE_PRO_PRICE_ID ?? null;
  if (planId === "business") return process.env.STRIPE_BUSINESS_PRICE_ID ?? null;
  return null;
}

export async function getOrCreateStripeCustomer(user: {
  id: string;
  email: string;
  stripeCustomerId: string | null;
}) {
  if (!stripe) throw new Error("Stripe is not configured");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!user) return;

  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const periodEnd = item?.current_period_end;
  const active = ["active", "trialing"].includes(subscription.status);
  const resolvedPlan = priceId ? planFromPriceId(priceId) : "pro";

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: active ? resolvedPlan : "free",
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? null,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}
