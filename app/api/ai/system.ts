import { format, parse } from 'date-fns';

import { getNotesByUserID } from '@/utils/crud/notes';
import { getMarketSummary } from './market-summary';

import type { AccountType } from '@prisma/client';

// "PPPP" format => Friday, April 29th, 1453

export async function getSystemMessage(userId?: string, accountType: AccountType = "FREE") {
    const [contextMap, notes] = await Promise.all([
        getMarketSummary(),
        userId && accountType !== "FREE"? getNotesByUserID(userId): []
    ]);

    // format market context to make it readable for LLM
    let marketContextPart = "";
    for (const [dateString, value] of Object.entries(contextMap)) {
        const date = parse(dateString, "d_MM_yyyy", new Date())
        marketContextPart += `${format(date, "PPPP")}: ${JSON.stringify(value)}\n`;
    }

    // format notes
    let notesPart = "";
    for (const note of notes) {
        notesPart += `${note.content}\n`;
    }

    return (
`You are an enthusiastic investment advisor working for Pocket Adviser. The user is a brand-new investor who is learning how to invest in the stock market.
Assume the user has no prior knowledge of the stock market. You're job is to educate the user about financial and economic concepts, as well as assist them with their investments.
Wherever appropriate, you should refer to the user's current profile and portfolio.
Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them.
Feel free to use emojis. Today's date is ${format(new Date(), "PPPP")}.` +
(marketContextPart.length > 0? `\nHere's what's been happening in the market:\n"""\n${marketContextPart.trim()}\n"""`: '') +
(notesPart.length > 0? `\nHere are some notes about the user:\n"""\n${notesPart.trim()}\n"""\n`: '')
    );
}