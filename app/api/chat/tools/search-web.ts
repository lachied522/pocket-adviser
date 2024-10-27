import { z } from "zod";
import { format } from "date-fns";

import { TavilyClient } from "@/utils/tavily/client";

export const description = "Search the internet for any other topic";

export const parameters = z.object({
    query: z.string().describe("The phrase that will be used to search the internet."),
    date: z.date().optional().default(new Date()).describe("The date you wish to receive results. Defaults to today."),
});

export async function searchWeb(query: string, date?: Date) {
    console.log(query);
    try {
        // adding date to query helps to get current information
        if (date) {
            query = query + " " + format(date, 'PPP');
        }
        return await new TavilyClient().getGeneralSearch(query);
    } catch (e) {
        console.error(e);
        return null;
    }
}