/*
  Warnings:

  - The values [FIRSTHOME] on the enum `Objective` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `image` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Objective_new" AS ENUM ('RETIREMENT', 'INCOME', 'PRESERVATION', 'DEPOSIT', 'CHILDREN', 'TRADING');
ALTER TABLE "Profile" ALTER COLUMN "objective" DROP DEFAULT;
ALTER TABLE "Profile" ALTER COLUMN "objective" TYPE "Objective_new" USING ("objective"::text::"Objective_new");
ALTER TYPE "Objective" RENAME TO "Objective_old";
ALTER TYPE "Objective_new" RENAME TO "Objective";
DROP TYPE "Objective_old";
ALTER TABLE "Profile" ALTER COLUMN "objective" SET DEFAULT 'RETIREMENT';
COMMIT;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "image";
