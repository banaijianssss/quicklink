import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { randomBytes } from "crypto";

export function generateInviteToken() {
  return randomBytes(18).toString("hex");
}

export async function createTeamInvite(params: {
  ownerId: string;
  plan: string;
  email: string;
  role?: string;
}) {
  const limits = getPlanLimits(params.plan);
  if (!limits.teamCollaboration) {
    return { error: "Team collaboration requires Business plan" as const };
  }

  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) return { error: "Invalid email" as const };

  const owner = await prisma.user.findUnique({ where: { id: params.ownerId } });
  if (owner?.email === email) {
    return { error: "Cannot invite yourself" as const };
  }

  const role = params.role === "viewer" ? "viewer" : "editor";

  try {
    const invite = await prisma.teamInvite.upsert({
      where: { ownerId_email: { ownerId: params.ownerId, email } },
      create: {
        ownerId: params.ownerId,
        email,
        role,
        token: generateInviteToken(),
      },
      update: { role, token: generateInviteToken(), acceptedAt: null, memberId: null },
    });
    return { invite };
  } catch {
    return { error: "Failed to create invite" as const };
  }
}

export async function acceptTeamInvite(params: {
  token: string;
  userId: string;
  userEmail: string;
}) {
  const invite = await prisma.teamInvite.findUnique({ where: { token: params.token } });
  if (!invite) return { error: "Invalid invite" as const };
  if (invite.acceptedAt) return { error: "Invite already accepted" as const };
  if (invite.email !== params.userEmail.toLowerCase()) {
    return { error: "Invite email does not match your account" as const };
  }

  const updated = await prisma.teamInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date(), memberId: params.userId },
  });
  return { invite: updated };
}

export async function listTeamForOwner(ownerId: string) {
  return prisma.teamInvite.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: { member: { select: { id: true, email: true, name: true } } },
  });
}

export async function listTeamsForMember(memberId: string) {
  return prisma.teamInvite.findMany({
    where: { memberId, acceptedAt: { not: null } },
    orderBy: { acceptedAt: "desc" },
    include: { owner: { select: { id: true, email: true, name: true } } },
  });
}

export async function canAccessOwnerLinks(userId: string, ownerId: string) {
  if (userId === ownerId) return true;
  const membership = await prisma.teamInvite.findFirst({
    where: { ownerId, memberId: userId, acceptedAt: { not: null } },
  });
  return Boolean(membership);
}