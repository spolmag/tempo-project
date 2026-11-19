/*
  Warnings:

  - You are about to drop the column `nameen` on the `courses` table. All the data in the column will be lost.
  - Added the required column `nameEn` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "nameen",
ADD COLUMN     "nameEn" TEXT NOT NULL;
