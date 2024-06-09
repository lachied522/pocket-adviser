/*
  Warnings:

  - Added the required column `priceTarget` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "beta" DOUBLE PRECISION,
ADD COLUMN     "priceTarget" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "Stock_name_symbol_idx" ON "Stock"("name", "symbol");
