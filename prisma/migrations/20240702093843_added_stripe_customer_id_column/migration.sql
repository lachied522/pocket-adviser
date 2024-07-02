-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('FREE', 'PAID', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT;
