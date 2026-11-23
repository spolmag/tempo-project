/*
  Warnings:

  - You are about to drop the column `textbookId` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "textbookId",
ADD COLUMN     "textbookIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
