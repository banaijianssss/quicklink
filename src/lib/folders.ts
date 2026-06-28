import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

export async function listUserFolders(userId: string) {
  return prisma.linkFolder.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { links: true } } },
  });
}

export async function createFolderForUser(params: {
  userId: string;
  plan: string;
  name: string;
  color?: string;
}) {
  const limits = getPlanLimits(params.plan);
  if (!limits.linkFolders) {
    return { error: "Link folders require Starter plan" as const };
  }

  const name = params.name.trim().slice(0, 60);
  if (!name) return { error: "Folder name required" as const };

  const folder = await prisma.linkFolder.create({
    data: {
      userId: params.userId,
      name,
      color: params.color?.trim() || "#2563eb",
    },
  });
  return { folder };
}