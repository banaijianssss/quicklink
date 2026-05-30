import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@quicklink.test";
  const passwordHash = await bcrypt.hash("demo12345", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      passwordHash,
      plan: "free",
    },
  });

  const existing = await prisma.link.findFirst({
    where: { userId: user.id, slug: "demo" },
  });

  if (!existing) {
    await prisma.link.create({
      data: {
        userId: user.id,
        slug: "demo",
        destination: "https://vercel.com",
        title: "Demo link",
      },
    });
  }

  console.log("Seed OK:");
  console.log("  Email: demo@quicklink.test");
  console.log("  Password: demo12345");
}

main()
  .finally(() => prisma.$disconnect());
