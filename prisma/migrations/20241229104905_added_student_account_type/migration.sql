/*
  Warnings:

  - Made the column `statistics` on table `Advice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'STUDENT';

-- AlterTable
ALTER TABLE "Advice" ALTER COLUMN "statistics" SET NOT NULL;
