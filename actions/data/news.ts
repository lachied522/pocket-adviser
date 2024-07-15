"use server";

import StockDataClient from "@/utils/data/client";

import type { StockNews } from "@/types/data";

const client = new StockDataClient();

export async function getNewsAction(symbols: string[], page: number = 0, limit: number = 12) {
    try {
        const data = await client.getNewsArticles(symbols, page, limit);
        const blacklist = [
            "www.youtube.com",
        ];
        const filteredData: StockNews[] = [];
        const titles: string[] = []; // sometimes duplicate articles are returned, filter these out
        for (const article of data) {
            const url = new URL(article.url);
            if (!(blacklist.includes(url.host) || titles.includes(article.title))) {
                filteredData.push(article);
                titles.push(article.title);
            }
        }
        return filteredData;
    } catch (e) {
        return [];
    }
}
