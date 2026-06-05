import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";
import { getOrCreateStripeCustomer, getPriceId, stripe, stripeConfigured } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add real API keys to .env" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const planId: string = body.plan ?? "pro";
  const billing: "monthly" | "annual" = body.billing === "annual" ? "annual" : "monthly";

  if (!["starter", "pro", "business"].includes(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (user.plan === planId) {
    return NextResponse.json({ error: `Already on ${planId}` }, { status: 400 });
  }

  const priceId = getPriceId(planId, billing);
  if (!priceId || !priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: `Price not configured for ${planId} (${billing}). Add STRIPE_${planId.toUpperCase()}_${billing === "annual" ? "ANNUAL_" : ""}PRICE_ID to .env` },
      { status: 503 }
    );
  }

  const customerId = await getOrCreateStripeCustomer(user);
  const planConfig = PLANS[planId as keyof typeof PLANS];
  const trialDays = planConfig.trialDays > 0 && user.plan === "free" ? planConfig.trialDays : 0;

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    ...(trialDays > 0 && {
      subscription_data: { trial_period_days: trialDays },
    }),
    success_url: `${getAppUrl()}/dashboard?upgraded=1`,
    cancel_url: `${getAppUrl()}/pricing`,
    metadata: { userId: user.id },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
