"use server";

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import type { StockNews } from "@/utils/financial_modelling_prep/types";

export async function getNewsAction(symbols: string[], page: number = 0, limit: number = 12) {
    try {
        const data = await new FinancialModellingPrepClient().getNewsArticles(symbols, page, limit);
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
