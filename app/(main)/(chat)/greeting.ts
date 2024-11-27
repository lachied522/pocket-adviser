import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { kv } from '@vercel/kv';

import { format } from 'date-fns';

import { getSystemMessage } from '../../api/chat/system';

const BASE_GREETING = `
Hello! I'm here to help you navigate the stock market and make informed investment decisions. I can provide insights into market events, assist with portfolio management, and offer guidance on potential investment opportunities.
`

function todayDate() {
    return format(new Date(), 'd_MM_yyyy');
}

async function generateMarketUpdate() {
    const systemMessage = await getSystemMessage();
    const { text } = await generateText({
        model: openai('gpt-4o'),
        system: systemMessage,
        messages: [{ role: "user", content: "What's happening in the market today? Be very brief, only two sentences maximum." }],
    });
    return text;
}

export async function getGreeting(): Promise<string> {
    const key = `DEFAULT_GREETING_${todayDate()}`;
    let marketUpdate = await kv.get(key);
    if (!marketUpdate) {
        // kv miss, generate new greeting
        marketUpdate = await generateMarketUpdate();
        // update kv
        kv.set(key, marketUpdate, { ex: 24 * 60 * 60 });
    }
    return `${BASE_GREETING}\n\n${marketUpdate}`;
}