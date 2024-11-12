/*
  Warnings:

  - You are about to drop the column `guest` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "guest";
