-- CreateEnum
CREATE TYPE "MailFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mailFrequnecy" "MailFrequency";
