-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('RECEPTION', 'SHOWROOM', 'STOCK_ROOM', 'CLASSROOM', 'OFFICE', 'OTHER');

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "parentId" TEXT,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "type" "ZoneType" NOT NULL DEFAULT 'CLASSROOM',
    "maxCapacity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zones_branchId_idx" ON "zones"("branchId");

-- CreateIndex
CREATE INDEX "zones_parentId_idx" ON "zones"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "zones_branchId_code_key" ON "zones"("branchId", "code");

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
