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

// ---------- Test branches ----------
const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
if (!admin) throw new Error("Seed an ADMIN user before branches");

const branchData = [
  { code: "BR01", nameTh: "สาขา 1", nameEn: "Branch 1" },
  { code: "BR02", nameTh: "สาขา 2", nameEn: "Branch 2" },
  {
    code: "BR03",
    nameTh: "สาขา 3 (ปิด)",
    nameEn: "Branch 3 (inactive)",
    isActive: false,
  },
];

// Insert only branches that don't exist yet (no transaction needed)
await prisma.branch.createMany({
  data: branchData.map((b) => ({
    ...b,
    createdById: admin.id,
    updatedById: admin.id,
  })),
  skipDuplicates: true,
});

// Load the ids (new or existing) by code
const branchRows = await prisma.branch.findMany({
  where: { code: { in: branchData.map((b) => b.code) } },
  select: { id: true, code: true },
});
const branches = Object.fromEntries(branchRows.map((b) => [b.code, b]));

// ---------- Link users to branches ----------
// Change these emails to match the users in your seed
const links: { email: string; codes: string[] }[] = [
  { email: "manager1@example.com", codes: ["BR01", "BR02"] },
  { email: "staff1@example.com", codes: ["BR01"] },
  { email: "teacher1@example.com", codes: ["BR01", "BR02", "BR03"] },
];

for (const { email, codes } of links) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn(`Skip: ${email} not found`);
    continue;
  }

  // Duplicate links are skipped because of @@id([userId, branchId])
  await prisma.userBranch.createMany({
    data: codes.map((code) => ({
      userId: user.id,
      branchId: branches[code].id,
      createdById: admin.id,
    })),
    skipDuplicates: true,
  });
}

console.log("Branches and user links seeded");
