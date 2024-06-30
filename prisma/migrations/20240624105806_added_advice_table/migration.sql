-- CreateEnum
CREATE TYPE "Action" AS ENUM ('DEPOSIT', 'WITHDRAW', 'REVIEW');

-- CreateTable
CREATE TABLE "Advice" (
    "id" SERIAL NOT NULL,
    "action" "Action" NOT NULL,
    "amount" DOUBLE PRECISION,
    "transactions" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Advice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Advice" ADD CONSTRAINT "Advice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
