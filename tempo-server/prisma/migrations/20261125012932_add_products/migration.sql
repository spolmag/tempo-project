-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('TEXTBOOK', 'INSTRUMENT', 'ACCESSORY', 'OTHER');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "barcode" TEXT,
    "parentId" TEXT,
    "category" "ProductCategory" NOT NULL DEFAULT 'TEXTBOOK',
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descriptionTh" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descriptionEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unitTh" TEXT NOT NULL DEFAULT 'ชิ้น',
    "unitEn" TEXT NOT NULL DEFAULT 'pcs',
    "costPrice" INTEGER,
    "sellingPrice" INTEGER,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 999,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_parentId_idx" ON "products"("parentId");

-- CreateIndex
CREATE INDEX "products_isHighlighted_sortOrder_idx" ON "products"("isHighlighted", "sortOrder");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
