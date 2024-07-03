"use server";

import { kv } from "@vercel/kv";

import StockDataClient from "@/utils/data/client";
import { getAggregatedStockData } from "@/utils/data/helpers";

import type { Stock } from "@prisma/client";

const KEY = "DATA_TRENDING_STOCKS";

export async function getTrendingStocksAction() {
    // stocks are considered trending if percentChange is greater than 5%
    let res: Stock[]|null = await kv.get(KEY);

    if (!res) {
        console.log("kv miss")
        const client = new StockDataClient();
        const [nasdaq, asx] = await Promise.all([
            client.getAllStocksByExchange("NASDAQ"),
            client.getAllStocksByExchange("ASX"),
        ]);

        // get list of 12 stocks
        const quotes = [...nasdaq, ...asx]
        .filter((quote) => quote.marketCap > 50_000_000_000)
        .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage))
        .slice(0, 12);

        res = await Promise.all(
            quotes.map((quote) => getAggregatedStockData(quote.symbol, quote.exchange as "NASDAQ"|"ASX", quote))
        ) as Stock[];

        // update kv
        kv.set(KEY, res, { ex: 24 * 60 * 60 });
    }

    return res;
}