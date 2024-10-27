import { z } from "zod";

import StockDataClient from "@/utils/data/client";
import { TavilyClient } from "@/utils/tavily/client";

export const description = "Get analyst price targets and analysis for a stock";

export const parameters = z.object({
    name: z.string().optional().describe("The name of the stock"),
    symbol: z.string().describe("The ticker symbol for the stock"),
    exchange: z.enum(["ASX", "NASDAQ", "NYSE"]).default("NASDAQ").describe("Exchange that stock trades on"),
});

export async function getAnalystResearch(
    symbol: string,
    name?: string,
    exchange?: "ASX"|"NASDAQ"|"NYSE"
) {
    try {
        let query;
        if (name && symbol) {
            query = `What are analysts saying about ${name} (${symbol}) stock?`;
        } else if (name || symbol) {
            query = `What are analysts saying about ${name || symbol} stock?`;
        } else {
            throw new Error("At least one of 'name' or 'symbol' must be defined");
        }

        // add '.AX' if exchange is ASX
        if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }

        const [searchResults, analystRatings] = await Promise.all([
            new TavilyClient().getLatestNews(query, 7),
            new StockDataClient().getAnalystResearch(symbol),
        ]);

        return {
            analystRatings,
            searchResults,
        }
    } catch (e) {
        console.error(`Error getting analyst research: ${e}`);
        return null;
    }
}