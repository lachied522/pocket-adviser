-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('STUDENT', 'CASUAL', 'PARTTIME', 'FULLTIME', 'SELFEMPLOYED', 'FREELANCE', 'RETIRED');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "employmentStatus" "EmploymentStatus" DEFAULT 'CASUAL',
ADD COLUMN     "percentAssetsInvested" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
ALTER COLUMN "income" SET DEFAULT 10000;
