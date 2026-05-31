"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  createLinkForUser,
  normalizeDestination,
} from "@/lib/links";
import { getPlanLimits } from "@/lib/plans";
import { createLinkSchema, updateLinkSchema } from "@/lib/schemas";
import { validateCustomSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createLinkAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = createLinkSchema.safeParse({
    destination: formData.get("destination"),
    title: (formData.get("title") as string) || undefined,
    customSlug: (formData.get("customSlug") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

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
    destination: (formData.get("destination") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    customSlug: (formData.get("customSlug") as string) || undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

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
    const limits = getPlanLimits(session.user.plan);
    if (!limits.customSlug) {
      return { error: "Custom slugs require Pro plan" };
    }
    const slugError = validateCustomSlug(parsed.data.customSlug);
    if (slugError) return { error: slugError };
    data.slug = parsed.data.customSlug;
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
