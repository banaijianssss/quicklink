"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

async function authRateLimit(action: string) {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const { success } = await rateLimit(`auth:${action}:${ip}`, 10, 15 * 60 * 1000);
  return success;
}

export async function registerUser(formData: FormData) {
  if (!(await authRateLimit("register"))) {
    return { error: "请求过于频繁，请稍后再试。" };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "输入无效，密码至少 8 位。" };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "无法创建账号，请检查邮箱或密码。" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    return { error: "账号已创建但登录失败，请手动登录。" };
  }

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  if (!(await authRateLimit("login"))) {
    return { error: "请求过于频繁，请稍后再试。" };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "邮箱或密码无效。" };
  }

  const { email, password } = parsed.data;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";
  const safeCallback =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeCallback,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "邮箱或密码无效。" };
    }
    throw error;
  }
}
