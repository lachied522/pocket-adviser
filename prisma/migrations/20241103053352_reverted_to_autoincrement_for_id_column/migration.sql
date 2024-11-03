/*
  Warnings:

  - The primary key for the `Advice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Advice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Advice" DROP CONSTRAINT "Advice_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Advice_pkey" PRIMARY KEY ("id");
