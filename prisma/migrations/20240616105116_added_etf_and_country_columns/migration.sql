-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isEtf" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "exchange" DROP DEFAULT;
