import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { generateSlug, validateCustomSlug } from "@/lib/slug";
import { Prisma } from "@prisma/client";

export async function countUserLinks(userId: string) {
  return prisma.link.count({ where: { userId } });
}

export async function canCreateLink(userId: string, plan: string) {
  const limits = getPlanLimits(plan);
  if (limits.maxLinks === -1) return true;
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
    return { error: "Link limit reached. Upgrade your plan for more links." as const };
  }

  if (params.customSlug) {
    const limits = getPlanLimits(params.plan);
    if (!limits.customSlug) {
      return { error: "Custom slugs require Pro plan" as const };
    }
    const slugError = validateCustomSlug(params.customSlug);
    if (slugError) return { error: slugError };

    try {
      const link = await prisma.link.create({
        data: {
          userId: params.userId,
          slug: params.customSlug,
          destination,
          title: params.title?.trim() || null,
        },
      });
      return { link };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: "Slug already taken" as const };
      }
      throw e;
    }
  }

  for (let attempts = 0; attempts < 10; attempts++) {
    const slug = generateSlug();
    try {
      const link = await prisma.link.create({
        data: {
          userId: params.userId,
          slug,
          destination,
          title: params.title?.trim() || null,
        },
      });
      return { link };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        continue;
      }
      throw e;
    }
  }

  return { error: "Could not generate slug" as const };
}

export async function recordClick(
  linkId: string,
  meta?: {
    referrer?: string | null;
    userAgent?: string | null;
    country?: string | null;
  }
) {
  await prisma.click.create({
    data: {
      linkId,
      referrer: meta?.referrer?.slice(0, 500) ?? null,
      userAgent: meta?.userAgent?.slice(0, 500) ?? null,
      country: meta?.country?.slice(0, 2) ?? null,
    },
  });
}

export const LINKS_PAGE_SIZE = 20;

export async function getUserLinksPage(userId: string, page: number) {
  const skip = Math.max(0, (page - 1) * LINKS_PAGE_SIZE);
  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: LINKS_PAGE_SIZE,
      include: { _count: { select: { clicks: true } } },
    }),
    prisma.link.count({ where: { userId } }),
  ]);
  return { links, total, totalPages: Math.ceil(total / LINKS_PAGE_SIZE) };
}
