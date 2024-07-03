/* Gets user portfolio for use in AI completion */
import { z } from "zod";

import StockDataClient from "@/utils/data/client";

import { getStockBySymbol } from "@/utils/crud/stocks";

import type { Stock } from "@prisma/client";
import type { ResolvedPromise } from "@/types/helpers";

const client = new StockDataClient();

type StockWithAnalystReseach = (
    Stock & {
        analystResearch: string|ResolvedPromise<ReturnType<typeof client.getAnalystResearch>>
    }
)

export const description = "Get financial information about a stock, including company description, price, price change, PE, EPS Growth, etc.";

export const parameters = z.object({
    symbol: z.string().describe("Ticker symbol for the stock, e.g. AAPL, BHP"),
    exchange: z.enum(["ASX", "NASDAQ"]).default("NASDAQ").describe("Exchange that stock trades on"),
    includeAnalystResearch: z.boolean().describe("Whether you also wish to get analyst research on this stock").default(false),
});

function format(stock: Stock|StockWithAnalystReseach) {
    return {
        ...stock,
        marketCap: Number(stock.marketCap) // remove BigInt type
    }
}

// it is necessary to define return type as any since the recursiveAICall doesn't know which function it is calling
export async function getStockInfo(symbol: string, exchange: "ASX"|"NASDAQ", includeAnalystResearch: boolean): Promise<any> {
    try {
        // add '.AX' if exchange is ASX
        if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }

        let stock: Stock|StockWithAnalystReseach|null = await getStockBySymbol(symbol);
        if (!stock) {
            // stock not in DB, try fetching directly from API
            const data = await client.getCompanyProfile(symbol);
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
            }            
        }

        if (!stock) return null;

        if (includeAnalystResearch) {
            const analystResearch = await client.getAnalystResearch(symbol);
            stock = {
                ...stock,
                analystResearch: analystResearch? analystResearch: "There was an error fetching analyst research for this stock"
            }
        }

        return format(stock);
    } catch (e) {
        console.log(e);
        return null;
    }
}