import { z } from "zod";

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import type { ResolvedPromise } from "@/types/helpers";

export const description = "Get financial information about a stock, including company description, price, price change, PE, EPS Growth, etc.";

export const parameters = z.object({
    symbol: z.string().describe("Ticker symbol for the stock, e.g. AAPL, BHP"),
    exchange: z.enum(["ASX", "NASDAQ", "NYSE"]).default("NASDAQ").describe("Exchange that stock trades on"),
});

export async function getStockInfo(symbol: string, exchange: "ASX"|"NASDAQ"|"NYSE") {
    // add '.AX' if exchange is ASX
    if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
        symbol = `${symbol}.AX`;
    }

    const data = await new FinancialModellingPrepClient().getCompanyOutlook(symbol);

    if (!data) {
        throw new Error("Stock not found");
    }
    
    // format data for interpretation by LLM
    return {
        symbol: data.profile.symbol,
        name: data.profile.companyName,
        exchange: data.profile.exchangeShortName,
        sector: data.profile.sector,
        industry: data.profile.industry,
        country: data.profile.country,
        description: data.profile.description,
        previousClose: data.profile.price,
        change: data.profile.changes,
        changePercent: (100 * (data.profile.changes / data.profile.price)).toFixed(2),
        marketCap: Number(data.profile.mktCap),
        dividendYield: data.ratios[0].dividendYielPercentageTTM.toFixed(2),
        peRatio: data.ratios[0].peRatioTTM.toFixed(2),
        pegRatio: data.ratios[0].pegRatioTTM.toFixed(2),
        profitMargin: data.ratios[0].netProfitMarginTTM.toFixed(2),
        debtToEquityRatio: data.ratios[0].debtEquityRatioTTM.toFixed(2),
        eps: data.financialsAnnual.income[0].eps,
        epsGrowthAnnual: (
            100 * (data.financialsAnnual.income[0].eps / data.financialsAnnual.income[data.financialsAnnual.income.length - 1].eps - 1)
        ).toFixed(2),
        analystRating: data.rating[0].ratingRecommendation,
    }
}