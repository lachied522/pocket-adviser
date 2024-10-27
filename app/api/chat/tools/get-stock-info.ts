import { z } from "zod";

import { getStockBySymbol } from "@/utils/crud/stocks";
import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import type { Stock } from "@prisma/client";

export const description = "Get financial information about a stock, including company description, price, price change, PE, EPS Growth, etc.";

export const parameters = z.object({
    symbol: z.string().describe("Ticker symbol for the stock, e.g. AAPL, BHP"),
    exchange: z.enum(["ASX", "NASDAQ", "NYSE"]).default("NASDAQ").describe("Exchange that stock trades on"),
});

function format(stock: Stock) {
    return {
        ...stock,
        marketCap: Number(stock.marketCap) // remove BigInt type
    }
}

export async function getStockInfo(symbol: string, exchange: "ASX"|"NASDAQ"|"NYSE") {
    try {
        // add '.AX' if exchange is ASX
        if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }

        let stock = await getStockBySymbol(symbol);
        if (!stock) {
            // stock not in DB, try fetching directly from API
            const data = await new FinancialModellingPrepClient().getCompanyProfile(symbol);
            if (!data) {
                // stock not found
                return null;
            }
            // format data to 'stock' type
            stock = {
                ...data,
                id: -1,
                name: data.companyName,
                previousClose: data.price,
                marketCap: data.mktCap,
                exchange: data.exchangeShortName,
                changesPercentage: data.changes,
                priceTarget: null,
                dividendAmount: null,
                dividendYield: null,
                pe: null,
                epsGrowth: null,
                tags: [],
            }            
        }

        if (!stock) return null;

        return format(stock);
    } catch (e) {
        console.log(e);
        return null;
    }
}