import { kv } from '@vercel/kv';

import { format } from 'date-fns';

import { getMarketNews } from './tools/get-market-news';

export async function getSystemMessage() {
    let message = (
        `You are an enthusiastic investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market. ` +
        `Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them. ` +
        `Feel free to use emojis. ` +
        `Today's date is ${format(new Date(), "PPPP")}. `
    );
    
    try {
        const key = `SYSTEM_CONTEXT_${format(new Date(), 'd_MM_yyyy')}`
        let context = await kv.get(key);
        if (!context) {
            // create a new system message
            const res = await getMarketNews("What's happening in the stock market?", 3);
            context = res?.answer || '';
            // update kv
            kv.set(key, context, { ex: 24 * 60 * 60 });
        }

        message += context;
    } catch (e) {
        console.error("Error fetching system message: ", e);
    }
    return message.trim();
}