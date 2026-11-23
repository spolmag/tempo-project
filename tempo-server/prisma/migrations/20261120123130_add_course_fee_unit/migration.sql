-- CreateEnum
CREATE TYPE "TuitionFeeUnit" AS ENUM ('PER_MONTH', 'PER_COURSE');

-- CreateEnum
CREATE TYPE "TeachingFeeUnit" AS ENUM ('PER_CLASS', 'PER_STUDENT_CLASS', 'PER_STUDENT_MONTH');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "teachingFeeUnit" "TeachingFeeUnit" NOT NULL DEFAULT 'PER_CLASS',
ADD COLUMN     "tuitionFeeUnit" "TuitionFeeUnit" NOT NULL DEFAULT 'PER_MONTH';
