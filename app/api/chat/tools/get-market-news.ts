import { z } from "zod";

import { TavilyClient } from "@/utils/tavily/client";

export const description = "Search latest news articles about the stock market in general";

export const parameters = z.object({
    query: z.string().default("What's happening in the stock market?").describe("Query to search news articles"),
    days: z.number().optional().default(5).describe("Number of days back from the current date to include in the search results"),
});

export async function getMarketNews(
    query: string,
    days?: number
): Promise<any> {
    try {
        return await new TavilyClient().getLatestNews(query, days);
    } catch (e) {
        console.error(e);
        return null;
    }
}