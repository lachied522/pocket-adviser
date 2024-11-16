import { FinancialModellingPrepClient } from "./client";

import type { Stock } from "@prisma/client";
import type { StockQuote, CompanyProfile, PriceTargetConsesus, IncomeGrowth, Ratios } from "@/types/data";

type Exchange = 'NASDAQ'|'ASX';

const client = new FinancialModellingPrepClient();

export async function getAggregatedStockData(
    symbol: string,
    exchange: Exchange = 'NASDAQ',
    _quote?: StockQuote // if quote data is available, it can be provided here to avoid unnecessary fetching
): Promise<Omit<Stock, 'id'> | null> {
    // aggregate data from required endpoints and format into db-friendly record

    // ensure symbol is capitalised
    symbol = symbol.toUpperCase();

    const promises: [
        Promise<StockQuote|null>,
        Promise<CompanyProfile|null>,
        Promise<PriceTargetConsesus|null>,
        Promise<IncomeGrowth|null>,
        Promise<Ratios|null>,
    ] = [
        _quote? new Promise((res) => res(_quote)): client.getQuote(symbol),
        client.getCompanyProfile(symbol),
        client.getPriceTarget(symbol),
        client.getGrowthRates(symbol),
        client.getRatios(symbol),
    ];

    const [quote, profile, consensus, growth, ratios] = await Promise.all(promises);

    if (!(quote && profile)) {
        // stock not found
        return null;
    }

    return {
        symbol,
        previousClose: quote.previousClose,
        changesPercentage: quote.changesPercentage,
        marketCap: quote.marketCap,
        exchange: quote.exchange,
        name: profile.companyName,
        description: profile.description,
        currency: profile.currency,
        country: profile.country,
        isEtf: profile.isEtf,
        sector: profile.sector,
        beta: profile.beta,
        priceTarget: consensus?.targetConsensus || null,
        pe: quote.pe || null,
        epsGrowth: growth?.growthEps || null,
        dividendAmount: profile.lastDiv || null,
        dividendYield: ratios?.dividendYield || null,
        tags: [],
    }
}