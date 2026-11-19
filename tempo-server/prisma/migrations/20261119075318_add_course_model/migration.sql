-- CreateEnum
CREATE TYPE "CourseClassType" AS ENUM ('PRIVATE', 'GROUP');

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" TEXT,
    "nameTh" TEXT NOT NULL,
    "nameen" TEXT NOT NULL,
    "descriptionTh" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descriptionEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "classType" "CourseClassType" NOT NULL DEFAULT 'PRIVATE',
    "totalLessons" INTEGER,
    "lessonDurationMin" INTEGER,
    "tuitionFee" INTEGER,
    "fulltimeTeachingFee" INTEGER,
    "parttimeTeachingFee" INTEGER,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 999,
    "textbookId" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE INDEX "courses_parentId_idx" ON "courses"("parentId");

-- CreateIndex
CREATE INDEX "courses_isHighlighted_sortOrder_idx" ON "courses"("isHighlighted", "sortOrder");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
