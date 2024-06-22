import axios from 'axios';
import * as cheerio from 'cheerio';

import { z } from "zod";

export const description = "Get the text content of an article from a url";

export const parameters = z.object({
    url: z.string().describe("Article url"),
});

export async function readArticle(url: string): Promise<string|null> {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let content = "";
        const article = $('article');
        article.find('div p').each((index, element) => {
            const text = $(element).text().trim();
            // Check if the text has more than a couple of words, e.g., more than 10 words
            if (text.split(/\s+/).length > 10) {
                content += text + " \n\n";
            }
        });

        return content;
    } catch (e) {
        console.error(e);
        return null;
    }
}