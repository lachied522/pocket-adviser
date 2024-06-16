import StockDataClient from "./client";

import type { Stock } from "@prisma/client";
import type { StockQuote, CompanyProfile, PriceTargetResult } from "@/types/api";

type Exchange = 'NASDAQ'|'ASX';

export async function getAggregatedStockData(
    symbol: string,
    exchange: Exchange = 'NASDAQ',
    _quote?: StockQuote // if quote data is available, it can be provided here to avoid unnecessary fetching
): Promise<Omit<Stock, 'id'> | null> {
    // aggregate data from required endpoints and format into db-friendly record

    // add '.AX' if exchange is ASX
    if (exchange === 'ASX') {
        symbol = `${symbol}.AX`;
    }

    // ensure symbol is capitalised
    symbol = symbol.toUpperCase();

    const client = new StockDataClient();
    const promises: [
        Promise<StockQuote | null>,
        Promise<CompanyProfile | null>,
        // Promise<PriceTargetResult> // price target not available on starter plan
    ] = [
        _quote? new Promise((res) => res(_quote)): client.getQuote(symbol),
        client.getCompanyProfile(symbol),
        // client.getPriceTaget(symbol),
    ];

    const [quote, profile] = await Promise.all(promises);

    if (!(quote && profile)) {
        // stock not found
        return null;
    }

    return {
        symbol,
        name: quote.name,
        exchange: quote.exchange,
        country: profile.country,
        isEtf: profile.isEtf,
        image: profile.image,
        previousClose: quote.previousClose,
        marketCap: quote.marketCap,
        sector: profile.sector,
        dividendAmount: profile.lastDiv, // TO DO
        beta: profile.beta,
        priceTarget: quote.previousClose * (1.07 + (Math.random() - 0.5) * 0.20),
        pe: 20, // TO DO
        epsGrowth: 0.20, // TO DO
    }
}

export async function getStocksByExchange(exchange: 'ASX'|'NASDAQ' = 'NASDAQ') {
    const client = new StockDataClient();
    const data = await client.getAllStocksByExchange(exchange);

    console.log(data.slice(5));
    return data;
}