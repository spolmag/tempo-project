import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("mrkratai", 10);

  const user = await prisma.user.upsert({
    where: { email: "spolmag@gmail.com" },
    update: {},
    create: {
      email: "spolmag@gmail.com",
      passwordHash,
      fullNameTh: "สุทธิพงษ์ ผลมาก",
      fullNameEn: "Suttipong Polmag",
      phone: "0895181958",
      role: "ADMIN",
      isActive: true,
      createdById: "system",
      updatedById: "system",
    },
  });

  console.log("Seeded user:", user.email, "| id:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
