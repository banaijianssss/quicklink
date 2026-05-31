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

export const createLinkSchema = z.object({
  destination: z.string().min(1).max(2048),
  title: z.string().max(120).optional(),
  customSlug: z.string().max(64).optional(),
});

export const updateLinkSchema = z.object({
  destination: z.string().min(1).max(2048).optional(),
  title: z.string().max(120).optional(),
  customSlug: z.string().max(64).optional(),
});
