import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { validateCustomSlug } from "@/lib/slug";
import { Prisma } from "@prisma/client";

export type BioLinkItem = {
  id: string;
  title: string;
  url: string;
  active: boolean;
};

export async function countUserBioPages(userId: string) {
  return prisma.bioPage.count({ where: { userId } });
}

export async function canCreateBioPage(userId: string, plan: string) {
  const limits = getPlanLimits(plan);
  if (!limits.bioPages) return false;
  if (limits.maxBioPages === -1) return true;
  const count = await countUserBioPages(userId);
  return count < limits.maxBioPages;
}

export function parseBioLinks(raw: unknown): BioLinkItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id: String((item as BioLinkItem).id || `link-${index}`),
      title: String((item as BioLinkItem).title || "").slice(0, 80),
      url: String((item as BioLinkItem).url || "").slice(0, 2048),
      active: (item as BioLinkItem).active !== false,
    }))
    .filter((item) => item.title && item.url)
    .slice(0, 20);
}

export async function createBioPageForUser(params: {
  userId: string;
  plan: string;
  slug: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: string;
  links?: BioLinkItem[];
}) {
  if (!getPlanLimits(params.plan).bioPages) {
    return { error: "Bio pages are not available on your plan" as const };
  }
  const canCreate = await canCreateBioPage(params.userId, params.plan);
  if (!canCreate) return { error: "Bio page limit reached" as const };

  const slugError = validateCustomSlug(params.slug);
  if (slugError) return { error: slugError };

  try {
    const page = await prisma.bioPage.create({
      data: {
        userId: params.userId,
        slug: params.slug,
        title: params.title?.trim() || null,
        bio: params.bio?.trim() || null,
        avatarUrl: params.avatarUrl?.trim() || null,
        theme: params.theme || "default",
        links: parseBioLinks(params.links || []),
      },
    });
    return { page };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Slug already taken" as const };
    }
    throw e;
  }
}

export async function updateBioPageForUser(params: {
  userId: string;
  pageId: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: string;
  links?: BioLinkItem[];
  active?: boolean;
}) {
  const page = await prisma.bioPage.findFirst({
    where: { id: params.pageId, userId: params.userId },
  });
  if (!page) return { error: "Not found" as const };

  const data: Prisma.BioPageUpdateInput = {};
  if (params.title !== undefined) data.title = params.title.trim() || null;
  if (params.bio !== undefined) data.bio = params.bio.trim() || null;
  if (params.avatarUrl !== undefined) data.avatarUrl = params.avatarUrl.trim() || null;
  if (params.theme !== undefined) data.theme = params.theme || "default";
  if (params.links !== undefined) data.links = parseBioLinks(params.links);
  if (params.active !== undefined) data.active = params.active;

  const updated = await prisma.bioPage.update({
    where: { id: params.pageId },
    data,
  });
  return { page: updated };
}

export async function recordBioView(
  bioPageId: string,
  meta?: { country?: string | null; userAgent?: string | null }
) {
  await prisma.bioView.create({
    data: {
      bioPageId,
      country: meta?.country?.slice(0, 2) ?? null,
      userAgent: meta?.userAgent?.slice(0, 500) ?? null,
    },
  });
}