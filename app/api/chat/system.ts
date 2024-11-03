import { format, parse } from 'date-fns';

import { getMarketContext } from './context';
import { getNotesByUserID } from '@/utils/crud/notes';

import type { AccountType } from '@prisma/client';

// "PPPP" format => Friday, April 29th, 1453

export async function getSystemMessage(userId?: string, accountType: AccountType = "FREE") {
    const [contextMap, notes] = await Promise.all([
        getMarketContext(),
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
`You are an enthusiastic investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market.
Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them.
Feel free to use emojis. Today's date is ${format(new Date(), "PPPP")}.` +
(marketContextPart.length > 0? `\nHere's what's been happening in the market:\n"""\n${marketContextPart.trim()}\n"""`: '') +
(notesPart.length > 0? `\nHere are some notes about the user:\n"""\n${notesPart.trim()}\n"""\n`: '')
    );
}