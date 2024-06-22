/* Gets user portfolio for use in AI completion */
import { z } from "zod";

import { getStockBySymbol } from "@/utils/crud/stocks";

import type { Stock } from "@prisma/client";

export const description = "Get financial information about a stock, including company description, price, price change, PE, EPS Growth, etc.";

export const parameters = z.object({
    symbol: z.string().describe("Ticker symbol for the stock, e.g. AAPL, BHP"),
    exchange: z.enum(["ASX", "NASDAQ"]).default("NASDAQ").describe("Exchange that stock trades on"),
});

function format(data: Stock) {
    return {
        ...data,
        marketCap: Number(data.marketCap) // remove BigInt type
    }
}

// it is necessary to define return type as any since the recursiveAICall doesn't know which function it is calling
export async function getStockInfo(symbol: string, exchange: "ASX"|"NASDAQ"): Promise<any> {
    try {
        // add '.AX' if exchange is ASX
        if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }
        const data = await getStockBySymbol(symbol);
        if (!data) return null;
        return format(data);
    } catch (e) {
        console.log(e);
        return null;
    }
}