import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const utmFields = {
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
};

const targetingFields = {
  iosDestination: z.string().max(2048).optional(),
  androidDestination: z.string().max(2048).optional(),
  geoRules: z.string().max(4000).optional(),
  deviceRules: z.string().max(4000).optional(),
  domainId: z.string().max(64).optional(),
  folderId: z.string().max(64).optional(),
  startsAt: z.string().max(32).optional(),
  abVariants: z.string().max(8000).optional(),
};

export const createLinkSchema = z.object({
  destination: z.string().min(1).max(2048),
  title: z.string().max(120).optional(),
  customSlug: z.string().max(64).optional(),
  tags: z.string().max(320).optional(),
  expiresAt: z.string().max(32).optional(),
  password: z.string().max(64).optional(),
  qrColor: z.string().max(7).optional(),
  ...utmFields,
  ...targetingFields,
});

export const updateLinkSchema = z.object({
  destination: z.string().min(1).max(2048).optional(),
  title: z.string().max(120).optional(),
  customSlug: z.string().max(64).optional(),
  tags: z.string().max(320).optional(),
  expiresAt: z.string().max(32).optional(),
  password: z.string().max(64).optional(),
  clearPassword: z.enum(["true", "false"]).optional(),
  qrColor: z.string().max(7).optional(),
  ...utmFields,
  ...targetingFields,
});
