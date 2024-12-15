"use server";
import { getStockById, getStocksByIds } from "@/utils/crud/stocks";

import { PrismaClient } from '@prisma/client';

export async function getStockByIdAction(id: number) {
    return await getStockById(id);
}

export async function getStocksByIdsAction(ids: number[]) {
    return await getStocksByIds(ids);
}

export async function searchStocksAction(query: string) {
    const prisma = new PrismaClient();
    return await prisma.stock.findMany({
        where: {
            OR: [
              {
                symbol: {
                  in: [query, `${query}.AX`],
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
        }
    });
}