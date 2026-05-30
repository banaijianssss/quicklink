"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createLinkForUser } from "@/lib/links";
import { revalidatePath } from "next/cache";

export async function createLinkAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const destination = formData.get("destination") as string;
  const title = (formData.get("title") as string) || undefined;
  const customSlug = (formData.get("customSlug") as string) || undefined;

  const result = await createLinkForUser({
    userId: session.user.id,
    plan: session.user.plan,
    destination,
    title,
    customSlug: customSlug || undefined,
  });

  if ("error" in result) return { error: result.error };

  revalidatePath("/dashboard");
  return { link: result.link };
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

  await prisma.link.updateMany({
    where: { id: linkId, userId: session.user.id },
    data: { active },
  });
  revalidatePath("/dashboard");
  return { success: true };
}
