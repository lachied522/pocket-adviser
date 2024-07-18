import { kv } from '@vercel/kv';

import { format } from 'date-fns';

import { searchWeb } from './tools/search-web';

export async function getSystemMessage() {
    const today = format(new Date(), "PPPP");

    let message = (
        `You are an enthusiastic investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market. ` +
        `Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them. ` +
        `Feel free to use emojis. ` +
        `Today's date is ${today}. `
    );
    
    try {
        const key = `SYSTEM_CONTEXT_${format(new Date(), 'd_MM_yyyy')}`
        let context = await kv.get(key);
        if (!context) {
            // create a new system message
            const res = await searchWeb("What's happening in the stock market today?", today);
            context = res["answer"];
            // update kv
            kv.set(key, context, { ex: 24 * 60 * 60 });
        }

        message += context;
    } catch (e) {
        console.error("Error fetching system message: ", e);
    }

    return message.trim();
}