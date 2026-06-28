import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getAppHostname() {
  try {
    return new URL(getAppUrl()).hostname;
  } catch {
    return "localhost";
  }
}

export function buildShortUrl(slug: string, customHost?: string) {
  const host = customHost || getAppHostname();
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/r/${slug}`;
}

export function buildBioUrl(slug: string, customHost?: string) {
  const host = customHost || getAppHostname();
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/p/${slug}`;
}