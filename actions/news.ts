"use server";

import StockDataClient from "@/utils/stocks/client";

const client = new StockDataClient();

export async function getNewsAction(symbols: string[], page: number = 0, limit: number = 12) {
    try {
        const data = await client.getNewsArticles(symbols, page, limit);
        return data;
    } catch (e) {
        return [];
    }
}
