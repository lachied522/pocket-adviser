/*
  Warnings:

  - You are about to drop the column `finalAdjUtility` on the `Advice` table. All the data in the column will be lost.
  - You are about to drop the column `initialAdjUtility` on the `Advice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Advice" DROP COLUMN "finalAdjUtility",
DROP COLUMN "initialAdjUtility",
ADD COLUMN     "statistics" JSONB;
