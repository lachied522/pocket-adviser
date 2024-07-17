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
        let context = await kv.get("SYSTEM_MESSAGE_CONTEXT");
        if (!context) {
            // create a new system message
            const res = await searchWeb("What's happening in the stock market today?", today);
            context = res["answer"];
            // update kv
            kv.set("SYSTEM_MESSAGE_CONTEXT", context, { ex: 24 * 60 * 60 });
        }

        message += context;
    } catch (e) {
        console.error("Error fetching system message: ", e);
    }

    return message.trim();
}