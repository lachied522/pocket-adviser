import type { Stock } from "@prisma/client";
import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function upsertStock(data: Omit<Stock, 'id'>) {
    return await prisma.stock.upsert({
        where: { symbol: data.symbol },
          update: data,
          create: data,
    });
}

export async function getStockById(id: number) {
    return await prisma.stock.findFirst({
        where: { id }
    });
}

export async function getStockBySymbol(symbol: string) {
    return await prisma.stock.findFirst({
        where: { symbol }
    });
}