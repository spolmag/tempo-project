/*
  Warnings:

  - The primary key for the `user_branches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `user_branches` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_branches" DROP CONSTRAINT "user_branches_pkey",
DROP COLUMN "role",
ADD CONSTRAINT "user_branches_pkey" PRIMARY KEY ("userId", "branchId");
