import { format, parse } from 'date-fns';

import { getMarketContext } from './context';

// "PPPP" format => Friday, April 29th, 1453

export async function getSystemMessage() {
    let marketContextPart = "";
    const contextMap = await getMarketContext();
    for (const [dateString, value] of Object.entries(contextMap)) {
        const date = parse(dateString, "d_MM_yyyy", new Date())
        marketContextPart += `\n\n${format(date, "PPPP")}: ${JSON.stringify(value)}`;
    }

    return (
        `You are an enthusiastic investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market. ` +
        `Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them. ` +
        `Feel free to use emojis. ` +
        `Today's date is ${format(new Date(), "PPPP")}.` +
        (marketContextPart.length > 0? marketContextPart: '')
    );
}