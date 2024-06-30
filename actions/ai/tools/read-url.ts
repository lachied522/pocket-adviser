import axios from 'axios';
import * as cheerio from 'cheerio';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

export const description = "Get a  content summary of a web page";

export const parameters = z.object({
    url: z.string().describe("Url of webpage to read"),
});

async function summariseContent(content: string) {
    const { text } = await generateText({
        model: openai('gpt-4-turbo'),
        prompt: (
            `The following is the text content that was scraped from a webpage.` +
            `Provide a summary of the web page and any important information.\n\n` +
            `${content}`
        ),
        maxTokens: 300,
    });

    return text;
}

export async function readUrl(url: string): Promise<string|null> {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let content = "";
        $('div p').each((_, element) => {
            const text = $(element).text().trim();
            // Check if the text has more than a couple of words, e.g., more than 10 words
            if (text.split(/\s+/).length > 10) {
                content += text + " \n\n";
            }
        });

        return await summariseContent(content);
    } catch (e) {
        console.error(e);
        return null;
    }
}