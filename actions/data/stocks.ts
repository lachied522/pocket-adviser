"use server";
import { getStockById, getStockBySymbol } from "@/utils/crud/stocks";
import { getAggregatedStockData } from "@/utils/financial_modelling_prep/helpers";

import { PrismaClient } from '@prisma/client';

import type { Stock } from "@prisma/client";

export async function getStockByIdAction(id: number) {
    return await getStockById(id);
}

export async function getStockBySymbolAction(
    symbol: string,
    exchange: "ASX"|"NASDAQ" = "NASDAQ"
): Promise<Omit<Stock, 'id'>|null> {
    // add '.AX' if exchange is ASX
    if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
        symbol = `${symbol}.AX`;
    }

    let data: Stock|Omit<Stock, 'id'>|null = await getStockBySymbol(symbol);

    if (!data) {
        // db miss
        data = await getAggregatedStockData(symbol)
    }

    return data;
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