import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { generateSlug, validateCustomSlug } from "@/lib/slug";

export async function countUserLinks(userId: string) {
  return prisma.link.count({ where: { userId } });
}

export async function canCreateLink(userId: string, plan: string) {
  const limits = getPlanLimits(plan);
  const count = await countUserLinks(userId);
  return count < limits.maxLinks;
}

export function normalizeDestination(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function createLinkForUser(params: {
  userId: string;
  plan: string;
  destination: string;
  title?: string;
  customSlug?: string;
}) {
  const destination = normalizeDestination(params.destination);
  if (!destination) {
    return { error: "Invalid URL" as const };
  }

  const canCreate = await canCreateLink(params.userId, params.plan);
  if (!canCreate) {
    return { error: "Link limit reached. Upgrade to Pro for more links." as const };
  }

  let slug: string;
  if (params.customSlug) {
    const limits = getPlanLimits(params.plan);
    if (!limits.customSlug) {
      return { error: "Custom slugs require Pro plan" as const };
    }
    const slugError = validateCustomSlug(params.customSlug);
    if (slugError) return { error: slugError };
    slug = params.customSlug;
    const existing = await prisma.link.findUnique({ where: { slug } });
    if (existing) return { error: "Slug already taken" as const };
  } else {
    let attempts = 0;
    do {
      slug = generateSlug();
      const existing = await prisma.link.findUnique({ where: { slug } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);
    if (attempts >= 10) return { error: "Could not generate slug" as const };
  }

  const link = await prisma.link.create({
    data: {
      userId: params.userId,
      slug,
      destination,
      title: params.title?.trim() || null,
    },
  });

  return { link };
}

export async function recordClick(linkId: string, meta?: {
  referrer?: string | null;
  userAgent?: string | null;
}) {
  await prisma.click.create({
    data: {
      linkId,
      referrer: meta?.referrer?.slice(0, 500) ?? null,
      userAgent: meta?.userAgent?.slice(0, 500) ?? null,
    },
  });
}
