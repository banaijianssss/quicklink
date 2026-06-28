import { prisma } from "@/lib/db";
import { createHmac, randomBytes } from "crypto";

export async function dispatchClickWebhooks(
  userId: string,
  payload: {
    linkId: string;
    slug: string;
    destination: string;
    country?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
  }
) {
  const hooks = await prisma.webhook.findMany({
    where: { userId, active: true, events: { has: "click" } },
  });
  if (!hooks.length) return;

  const body = JSON.stringify({
    event: "link.click",
    createdAt: new Date().toISOString(),
    data: payload,
  });

  await Promise.allSettled(
    hooks.map(async (hook) => {
      const signature = createHmac("sha256", hook.secret).update(body).digest("hex");
      await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-QuickLink-Signature": signature,
          "X-QuickLink-Event": "link.click",
        },
        body,
        signal: AbortSignal.timeout(5000),
      });
    })
  );
}

export function generateWebhookSecret() {
  return randomBytes(24).toString("hex");
}