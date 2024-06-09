import StockDataClient from "./client";

import type { Stock } from "@prisma/client";
import type { StockQuote, CompanyProfile, PriceTargetResult } from "@/types/api";

export async function getAllStockData(symbol: string): Promise<Omit<Stock, 'id'> | null> {
    // aggregate data from required endpoints and format into db-friendly record
    const client = new StockDataClient();
    const promises: [
        Promise<StockQuote | null>,
        Promise<CompanyProfile | null>,
        // Promise<PriceTargetResult> // price target not available on starter plan
    ] = [
        client.getQuote(symbol),
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