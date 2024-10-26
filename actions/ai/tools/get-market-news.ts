import { z } from "zod";

import { TavillyClient } from "@/utils/tavilly/client";

export const description = "Search latest news articles about the stock market in general";

export const parameters = z.object({
    days: z.number().optional().describe("Number of days back from the current date to include in the search results").default(5),
});

export async function getMarketNews(
    days?: number
): Promise<any> {
    try {
        const query = "What's happening in the stock market?";
        return await new TavillyClient().getLatestNews(query, days);
    } catch (e) {
        return null;
    }
}