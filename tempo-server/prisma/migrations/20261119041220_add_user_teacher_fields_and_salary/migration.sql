-- CreateEnum
CREATE TYPE "TeacherType" AS ENUM ('FULL_TIME', 'PART_TIME');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "monthlySalary" INTEGER,
ADD COLUMN     "teacherGrade" TEXT,
ADD COLUMN     "teacherType" "TeacherType";
