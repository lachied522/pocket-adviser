import { z } from "zod";

import { TavilyClient } from "@/utils/tavily/client";

export const description = "Search the web for latest news articles about a stock";

export const parameters = z.object({
    name: z.string().optional().describe("The name of the stock to get news on"),
    symbol: z.string().optional().describe("The ticker symbol for the stock to get news on"),
    days: z.number().optional().describe("Number of days back from the current date to include in the search results").default(5),
})
.refine(({ name, symbol }) => name || symbol, "At least one field must be defined");

export async function getStockNews(
    name?: string,
    symbol?: string,
    days?: number
): Promise<any> {
    try {
        let query;
        if (name && symbol) {
            query = `What's the latest news for ${name} (${symbol}) stock?`;
        } else if (name) {
            query = `What's the latest news for ${name} stock?`;
        } else if (symbol) {
            query = `What's the latest news for ${symbol} stock?`;
        } else {
            throw new Error("At least one of 'name' or 'symbol' must be defined");
        }
        return await new TavilyClient().getLatestNews(query, days);
    } catch (e) {
        console.error(e);
        return null;
    }
}