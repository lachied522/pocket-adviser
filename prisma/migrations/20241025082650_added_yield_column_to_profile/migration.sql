/*
  Warnings:

  - You are about to drop the column `passive` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `yield` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "passive",
DROP COLUMN "yield",
ADD COLUMN     "targetYield" DOUBLE PRECISION;
