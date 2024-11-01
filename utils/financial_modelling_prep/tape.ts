import { kv } from "@vercel/kv";

import { FinancialModellingPrepClient } from "./client";
import { getAggregatedStockData } from "./helpers";

import type { Stock } from "@prisma/client";

async function getTrendingStocks(client: FinancialModellingPrepClient) {
    const [nasdaq, asx] = await Promise.all([
        client.getAllStocksByExchange("NASDAQ"),
        client.getAllStocksByExchange("ASX"),
    ]);

    // get list of 20 stocks sorted by percent change
    const quotes = [...nasdaq, ...asx]
    .filter((quote) => quote.marketCap > 50_000_000_000)
    .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage))
    .slice(0, 24);

    const data = await Promise.all(
        quotes.map((quote) => getAggregatedStockData(quote.symbol, quote.exchange as "NASDAQ"|"ASX", quote))
    ) as Stock[];

    // filter further by removing etfs and indeces
    return data.filter((obj) => !obj.isEtf && !obj.name.toLowerCase().includes('index'));
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
    const client = new FinancialModellingPrepClient();
    const [spxQuote, stocks] = await Promise.all([
        client.getQuote("^SPX"),
        getTrendingStocks(client),
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