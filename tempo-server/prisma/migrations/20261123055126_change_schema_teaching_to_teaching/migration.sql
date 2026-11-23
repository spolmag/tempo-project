/*
  Warnings:

  - You are about to drop the column `fulltimeTeachingFee` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `parttimeTeachingFee` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "fulltimeTeachingFee",
DROP COLUMN "parttimeTeachingFee",
ADD COLUMN     "fullTimeTeachingFee" INTEGER,
ADD COLUMN     "partTimeTeachingFee" INTEGER;
