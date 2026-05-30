import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";
import { getOrCreateStripeCustomer, stripe, stripeConfigured } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
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

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (user.plan === "pro") {
    return NextResponse.json({ error: "Already on Pro" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(user);
  const priceId = process.env.STRIPE_PRO_PRICE_ID!;

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getAppUrl()}/dashboard?upgraded=1`,
    cancel_url: `${getAppUrl()}/pricing`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
