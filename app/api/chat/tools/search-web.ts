import { z } from "zod";

import { TavilyClient } from "@/utils/tavily/client";

export const description = "Search the internet for any other topic";

export const parameters = z.object({
    query: z.string().describe("The phrase that will be used to search the internet."),
});

export async function searchWeb(query: string) {
    try {
        return await new TavilyClient().getGeneralSearch(query);
    } catch (e) {
        console.error(e);
        return null;
    }
}