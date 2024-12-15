-- CreateEnum
CREATE TYPE "AdviceType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'REVIEW', 'DAILY');

-- AlterTable
ALTER TABLE "Advice" ADD COLUMN     "type" "AdviceType" NOT NULL DEFAULT 'REVIEW';

-- DropEnum
DROP TYPE "Action";
