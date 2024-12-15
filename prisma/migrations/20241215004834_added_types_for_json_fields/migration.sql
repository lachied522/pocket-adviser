/*
  Warnings:

  - You are about to drop the column `action` on the `Advice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Advice" DROP COLUMN "action",
ADD COLUMN     "stockData" JSONB[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyAdviceViewed" BOOLEAN NOT NULL DEFAULT true;
