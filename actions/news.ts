"use server";

import StockDataClient from "@/utils/stocks/client";

const client = new StockDataClient();

export async function getNewsAction(symbols: string[], page: number = 0, limit: number = 12) {
    try {
        const data = await client.getNewsArticles(symbols, page, limit);
        const blacklist = [
            "www.youtube.com",
        ];
        const filteredData = [];
        for (const article of data) {
            const url = new URL(article.url);
            if (!blacklist.includes(url.host)) {
                filteredData.push(article);
            }
        }
        return filteredData;
    } catch (e) {
        return [];
    }
}
