import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { generateSlug, validateCustomSlug } from "@/lib/slug";
import {
  parseAbVariants,
  parseAbVariantsFromText,
  pickAbVariant,
  type AbVariant,
} from "@/lib/ab-test";
import {
  parseDeviceRulesFromText,
  parseGeoRulesFromText,
} from "@/lib/targeting";
import { appendUtmParams, parseTagsInput, type UtmParams } from "@/lib/utm";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

export type LinkCreateInput = {
  userId: string;
  plan: string;
  destination: string;
  title?: string;
  customSlug?: string;
  tags?: string;
  expiresAt?: string;
  password?: string;
  qrColor?: string;
  iosDestination?: string;
  androidDestination?: string;
  geoRules?: string;
  deviceRules?: string;
  domainId?: string;
  folderId?: string;
  startsAt?: string;
  abVariants?: string;
} & UtmParams;

function parseExpiresAt(raw?: string): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeQrColor(raw?: string): string | null {
  if (!raw?.trim()) return null;
  return /^#[0-9A-Fa-f]{6}$/.test(raw.trim()) ? raw.trim() : null;
}

function normalizeOptionalUrl(raw?: string): string | null {
  if (!raw?.trim()) return null;
  return normalizeDestination(raw);
}

function buildPhase3Data(params: LinkCreateInput, limits: ReturnType<typeof getPlanLimits>) {
  const data: {
    startsAt?: Date | null;
    abVariants?: AbVariant[] | undefined;
  } = {};

  if (limits.linkScheduling && params.startsAt?.trim()) {
    const d = new Date(params.startsAt);
    data.startsAt = Number.isNaN(d.getTime()) ? null : d;
  }

  if (limits.abTesting && params.abVariants?.trim()) {
    const variants = parseAbVariantsFromText(params.abVariants)
      .map((v) => ({ ...v, destination: normalizeDestination(v.destination) || v.destination }))
      .filter((v) => v.destination);
    if (variants.length) data.abVariants = variants;
  }

  return data;
}

function buildTargetingData(params: LinkCreateInput, limits: ReturnType<typeof getPlanLimits>) {
  const data: {
    iosDestination?: string | null;
    androidDestination?: string | null;
    geoRules?: Prisma.InputJsonValue;
    deviceRules?: Prisma.InputJsonValue;
  } = {};

  if (limits.deviceTargeting) {
    data.iosDestination = normalizeOptionalUrl(params.iosDestination);
    data.androidDestination = normalizeOptionalUrl(params.androidDestination);
    const deviceRules = parseDeviceRulesFromText(params.deviceRules);
    if (deviceRules.length) data.deviceRules = deviceRules;
  }

  if (limits.geoTargeting) {
    const geoRules = parseGeoRulesFromText(params.geoRules);
    if (geoRules.length) data.geoRules = geoRules;
  }

  return data;
}

function buildLinkData(params: LinkCreateInput, destination: string) {
  const limits = getPlanLimits(params.plan);
  const tags = limits.linkTags ? parseTagsInput(params.tags) : [];
  const expiresAt = limits.linkExpiration ? parseExpiresAt(params.expiresAt) : null;
  const qrColor = limits.qrCustomization ? normalizeQrColor(params.qrColor) : null;

  return {
    destination: appendUtmParams(destination, {
      utmSource: params.utmSource,
      utmMedium: params.utmMedium,
      utmCampaign: params.utmCampaign,
      utmTerm: params.utmTerm,
      utmContent: params.utmContent,
    }),
    title: params.title?.trim() || null,
    tags,
    utmSource: params.utmSource?.trim() || null,
    utmMedium: params.utmMedium?.trim() || null,
    utmCampaign: params.utmCampaign?.trim() || null,
    utmTerm: params.utmTerm?.trim() || null,
    utmContent: params.utmContent?.trim() || null,
    expiresAt,
    qrColor: qrColor ?? "#000000",
    ...buildTargetingData(params, limits),
    ...buildPhase3Data(params, limits),
  };
}

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

export async function createLinkForUser(params: LinkCreateInput) {
  const destination = normalizeDestination(params.destination);
  if (!destination) {
    return { error: "Invalid URL" as const };
  }

  const limits = getPlanLimits(params.plan);
  if (params.password?.trim() && !limits.passwordProtection) {
    return { error: "Password protection requires Pro plan" as const };
  }
  if (params.expiresAt?.trim() && !limits.linkExpiration) {
    return { error: "Link expiration requires Pro plan" as const };
  }

  const canCreate = await canCreateLink(params.userId, params.plan);
  if (!canCreate) {
    return { error: "Link limit reached. Upgrade your plan for more links." as const };
  }

  const baseData = buildLinkData(params, destination);
  const passwordHash = params.password?.trim()
    ? await bcrypt.hash(params.password.trim(), 10)
    : null;

  let domainId: string | null = null;
  if (params.domainId?.trim() && limits.customDomain) {
    const domain = await prisma.customDomain.findFirst({
      where: { id: params.domainId.trim(), userId: params.userId, verified: true },
    });
    if (!domain) return { error: "Invalid or unverified domain" as const };
    domainId = domain.id;
  }

  let folderId: string | null = null;
  if (params.folderId?.trim() && limits.linkFolders) {
    const folder = await prisma.linkFolder.findFirst({
      where: { id: params.folderId.trim(), userId: params.userId },
    });
    if (!folder) return { error: "Invalid folder" as const };
    folderId = folder.id;
  }

  const createPayload = {
    userId: params.userId,
    ...baseData,
    passwordHash,
    domainId,
    folderId,
  };

  if (params.customSlug) {
    if (!limits.customSlug) {
      return { error: "Custom slugs require Starter plan" as const };
    }
    const slugError = validateCustomSlug(params.customSlug);
    if (slugError) return { error: slugError };

    try {
      const link = await prisma.link.create({
        data: { ...createPayload, slug: params.customSlug },
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
        data: { ...createPayload, slug },
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
    variantIndex?: number | null;
  }
) {
  await prisma.click.create({
    data: {
      linkId,
      referrer: meta?.referrer?.slice(0, 500) ?? null,
      userAgent: meta?.userAgent?.slice(0, 500) ?? null,
      country: meta?.country?.slice(0, 2) ?? null,
      variantIndex: meta?.variantIndex ?? null,
    },
  });
}

export function isLinkNotStarted(startsAt: Date | null | undefined): boolean {
  if (!startsAt) return false;
  return startsAt.getTime() > Date.now();
}

export function resolveLinkDestination(link: {
  destination: string;
  abVariants?: unknown;
}): { destination: string; variantIndex: number | null } {
  const variants = parseAbVariants(link.abVariants);
  if (variants.length < 2) {
    return { destination: link.destination, variantIndex: null };
  }
  const { index, destination } = pickAbVariant(variants);
  return { destination: destination || link.destination, variantIndex: index };
}

export const LINKS_PAGE_SIZE = 20;

export async function getUserLinksPage(
  userId: string,
  page: number,
  options?: { q?: string; tag?: string; folderId?: string }
) {
  const skip = Math.max(0, (page - 1) * LINKS_PAGE_SIZE);
  const where: Prisma.LinkWhereInput = { userId };

  if (options?.folderId?.trim()) {
    where.folderId = options.folderId.trim();
  }

  if (options?.q?.trim()) {
    const q = options.q.trim();
    where.OR = [
      { slug: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { destination: { contains: q, mode: "insensitive" } },
    ];
  }
  if (options?.tag?.trim()) {
    where.tags = { has: options.tag.trim().toLowerCase() };
  }

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: LINKS_PAGE_SIZE,
      include: {
        _count: { select: { clicks: true } },
        domain: { select: { hostname: true } },
        folder: { select: { id: true, name: true, color: true } },
      },
    }),
    prisma.link.count({ where }),
  ]);
  return { links, total, totalPages: Math.ceil(total / LINKS_PAGE_SIZE) };
}

export function isLinkExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() <= Date.now();
}