import { kv } from "@vercel/kv";

import StockDataClient from "@/utils/data/client";

import { getAggregatedStockData } from "@/utils/data/helpers";

import type { Stock } from "@prisma/client";

const client = new StockDataClient();

async function getTrendingStocks() {
    const [nasdaq, asx] = await Promise.all([
        client.getAllStocksByExchange("NASDAQ"),
        client.getAllStocksByExchange("ASX"),
    ]);

    // get list of 20 stocks sorted by percent change
    const quotes = [...nasdaq, ...asx]
    .filter((quote) => quote.marketCap > 50_000_000_000)
    .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage))
    .slice(0, 20);

    return await Promise.all(
        quotes.map((quote) => getAggregatedStockData(quote.symbol, quote.exchange as "NASDAQ"|"ASX", quote))
    ) as Stock[];
}

const KEY = "DATA_STOCK_TAPE";

type TAPE = {
    indeces: Pick<Stock, 'name'|'symbol'|'previousClose'|'changesPercentage'>[]
    stocks: Stock[]
}

export async function getStockTape(): Promise<TAPE> {
    let res: TAPE|null = await kv.get(KEY);

    if (res) return res;

    // kv miss, fetch new data
    const [spxQuote, stocks] = await Promise.all([
        client.getQuote("^SPX"),
        getTrendingStocks(),
    ]);

    res = {
        indeces: [{
            ...spxQuote!,
            symbol: 'SPY', // override '^SPX'
        }],
        stocks,
    }

    // update kv
    kv.set(KEY, res, { ex: 24 * 60 * 60 });
    return res;
}