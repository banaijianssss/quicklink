"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  createLinkForUser,
  normalizeDestination,
} from "@/lib/links";
import { getPlanLimits } from "@/lib/plans";
import { createLinkSchema, updateLinkSchema } from "@/lib/schemas";
import { parseTagsInput } from "@/lib/utm";
import { validateCustomSlug } from "@/lib/slug";
import { parseAbVariantsFromText } from "@/lib/ab-test";
import {
  parseDeviceRulesFromText,
  parseGeoRulesFromText,
} from "@/lib/targeting";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

function parseFormFields(formData: FormData) {
  return {
    destination: formData.get("destination"),
    title: (formData.get("title") as string) || undefined,
    customSlug: (formData.get("customSlug") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
    expiresAt: (formData.get("expiresAt") as string) || undefined,
    password: (formData.get("password") as string) || undefined,
    qrColor: (formData.get("qrColor") as string) || undefined,
    utmSource: (formData.get("utmSource") as string) || undefined,
    utmMedium: (formData.get("utmMedium") as string) || undefined,
    utmCampaign: (formData.get("utmCampaign") as string) || undefined,
    utmTerm: (formData.get("utmTerm") as string) || undefined,
    utmContent: (formData.get("utmContent") as string) || undefined,
    iosDestination: (formData.get("iosDestination") as string) || undefined,
    androidDestination: (formData.get("androidDestination") as string) || undefined,
    geoRules: (formData.get("geoRules") as string) || undefined,
    deviceRules: (formData.get("deviceRules") as string) || undefined,
    domainId: (formData.get("domainId") as string) || undefined,
    folderId: (formData.get("folderId") as string) || undefined,
    startsAt: (formData.get("startsAt") as string) || undefined,
    abVariants: (formData.get("abVariants") as string) || undefined,
  };
}

function parseFormToCreate(formData: FormData) {
  return createLinkSchema.safeParse(parseFormFields(formData));
}

export async function createLinkAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = parseFormToCreate(formData);
  if (!parsed.success) return { error: "Invalid input" };

  const result = await createLinkForUser({
    userId: session.user.id,
    plan: session.user.plan,
    ...parsed.data,
    customSlug: parsed.data.customSlug || undefined,
    title: parsed.data.title || undefined,
  });

  if ("error" in result) return { error: result.error };

  revalidatePath("/dashboard");
  return { link: result.link };
}

export async function updateLinkAction(linkId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const link = await prisma.link.findFirst({
    where: { id: linkId, userId: session.user.id },
  });
  if (!link) return { error: "Not found" };

  const parsed = updateLinkSchema.safeParse({
    ...parseFormFields(formData),
    clearPassword: (formData.get("clearPassword") as string) || undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

  const limits = getPlanLimits(session.user.plan);
  const data: Prisma.LinkUpdateInput = {};

  if (parsed.data.destination) {
    const destination = normalizeDestination(parsed.data.destination);
    if (!destination) return { error: "Invalid URL" };
    data.destination = destination;
  }

  if (parsed.data.title !== undefined) {
    data.title = parsed.data.title.trim() || null;
  }

  if (parsed.data.customSlug && parsed.data.customSlug !== link.slug) {
    if (!limits.customSlug) {
      return { error: "Custom slugs require Starter plan" };
    }
    const slugError = validateCustomSlug(parsed.data.customSlug);
    if (slugError) return { error: slugError };
    data.slug = parsed.data.customSlug;
  }

  if (parsed.data.tags !== undefined && limits.linkTags) {
    data.tags = parseTagsInput(parsed.data.tags);
  }

  if (limits.linkExpiration && parsed.data.expiresAt !== undefined) {
    data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  }

  if (limits.passwordProtection) {
    if (parsed.data.clearPassword === "true") {
      data.passwordHash = null;
    } else if (parsed.data.password?.trim()) {
      data.passwordHash = await bcrypt.hash(parsed.data.password.trim(), 10);
    }
  }

  if (limits.qrCustomization && parsed.data.qrColor) {
    data.qrColor = parsed.data.qrColor;
  }

  if (limits.deviceTargeting) {
    if (parsed.data.iosDestination !== undefined) {
      const ios = normalizeDestination(parsed.data.iosDestination);
      data.iosDestination = ios;
    }
    if (parsed.data.androidDestination !== undefined) {
      const android = normalizeDestination(parsed.data.androidDestination);
      data.androidDestination = android;
    }
    if (parsed.data.deviceRules !== undefined) {
      const rules = parseDeviceRulesFromText(parsed.data.deviceRules);
      data.deviceRules = rules.length ? rules : Prisma.DbNull;
    }
  }

  if (limits.geoTargeting && parsed.data.geoRules !== undefined) {
    const rules = parseGeoRulesFromText(parsed.data.geoRules);
    data.geoRules = rules.length ? rules : Prisma.DbNull;
  }

  if (limits.customDomain && parsed.data.domainId !== undefined) {
    const domainId = parsed.data.domainId?.trim();
    if (!domainId) {
      data.domain = { disconnect: true };
    } else {
      const domain = await prisma.customDomain.findFirst({
        where: { id: domainId, userId: session.user.id, verified: true },
      });
      if (!domain) return { error: "Invalid or unverified domain" };
      data.domain = { connect: { id: domain.id } };
    }
  }

  if (limits.linkFolders && parsed.data.folderId !== undefined) {
    const folderId = parsed.data.folderId?.trim();
    if (!folderId) {
      data.folder = { disconnect: true };
    } else {
      const folder = await prisma.linkFolder.findFirst({
        where: { id: folderId, userId: session.user.id },
      });
      if (!folder) return { error: "Invalid folder" };
      data.folder = { connect: { id: folder.id } };
    }
  }

  if (limits.linkScheduling && parsed.data.startsAt !== undefined) {
    data.startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : null;
  }

  if (limits.abTesting && parsed.data.abVariants !== undefined) {
    const variants = parseAbVariantsFromText(parsed.data.abVariants)
      .map((v) => ({
        ...v,
        destination: normalizeDestination(v.destination) || v.destination,
      }))
      .filter((v) => v.destination);
    data.abVariants = variants.length ? variants : Prisma.DbNull;
  }

  try {
    const updated = await prisma.link.update({
      where: { id: linkId },
      data,
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/links/${linkId}`);
    return { link: updated };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Slug already taken" };
    }
    throw e;
  }
}

export async function deleteLinkAction(linkId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const link = await prisma.link.findFirst({
    where: { id: linkId, userId: session.user.id },
  });
  if (!link) return { error: "Not found" };

  await prisma.link.delete({ where: { id: linkId } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleLinkAction(linkId: string, active: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const result = await prisma.link.updateMany({
    where: { id: linkId, userId: session.user.id },
    data: { active },
  });

  if (result.count === 0) return { error: "Not found" };

  revalidatePath("/dashboard");
  return { success: true };
}