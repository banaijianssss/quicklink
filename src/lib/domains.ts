import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { randomBytes } from "crypto";
import { promises as dns } from "dns";

const HOSTNAME_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export function normalizeHostname(raw: string): string | null {
  const host = raw.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]?.split(":")[0];
  if (!host || !HOSTNAME_RE.test(host)) return null;
  return host;
}

export function getDomainLimit(plan: string): number {
  const limits = getPlanLimits(plan);
  if (!limits.customDomain) return 0;
  if (plan === "business") return 5;
  if (plan === "pro") return 1;
  return 0;
}

export async function countUserDomains(userId: string) {
  return prisma.customDomain.count({ where: { userId } });
}

export async function createDomainForUser(userId: string, plan: string, hostname: string) {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return { error: "Invalid hostname" as const };

  const limit = getDomainLimit(plan);
  if (limit <= 0) return { error: "Custom domains require Pro or Business plan" as const };

  const count = await countUserDomains(userId);
  if (count >= limit) return { error: `Domain limit reached (${limit})` as const };

  try {
    const domain = await prisma.customDomain.create({
      data: {
        userId,
        hostname: normalized,
        verificationToken: randomBytes(16).toString("hex"),
      },
    });
    return { domain };
  } catch {
    return { error: "Domain already registered" as const };
  }
}

export async function verifyDomainOwnership(domainId: string, userId: string) {
  const domain = await prisma.customDomain.findFirst({
    where: { id: domainId, userId },
  });
  if (!domain) return { error: "Not found" as const };
  if (domain.verified) return { domain };

  const recordName = `_quicklink-verify.${domain.hostname}`;
  try {
    const records = await dns.resolveTxt(recordName);
    const flat = records.map((r) => r.join("")).join("");
    if (flat.includes(domain.verificationToken)) {
      const updated = await prisma.customDomain.update({
        where: { id: domain.id },
        data: { verified: true },
      });
      return { domain: updated };
    }
    return { error: `TXT record not found. Add: ${recordName} = ${domain.verificationToken}` as const };
  } catch {
    return {
      error: `TXT record not found. Add: ${recordName} = ${domain.verificationToken}` as const,
    };
  }
}

export async function getVerifiedDomainByHost(hostname: string) {
  const host = normalizeHostname(hostname);
  if (!host) return null;
  return prisma.customDomain.findFirst({
    where: { hostname: host, verified: true },
  });
}