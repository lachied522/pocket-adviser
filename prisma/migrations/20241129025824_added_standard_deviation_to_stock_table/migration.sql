/*
  Warnings:

  - You are about to drop the column `changesPercentage` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `pe` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "changesPercentage",
DROP COLUMN "pe",
ADD COLUMN     "change" DOUBLE PRECISION,
ADD COLUMN     "peRatio" DOUBLE PRECISION,
ADD COLUMN     "stdDev" DOUBLE PRECISION;
