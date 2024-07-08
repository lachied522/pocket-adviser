/*
  Warnings:

  - You are about to drop the column `mailFrequnecy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "mailFrequnecy",
ADD COLUMN     "mailFrequency" "MailFrequency";
