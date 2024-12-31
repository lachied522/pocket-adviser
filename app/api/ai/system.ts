import { format } from 'date-fns';

import { getNotesByUserID } from '@/utils/crud/notes';
import { getFullMarketSummary } from './market-summary';

import type { AccountType } from '@prisma/client';

export async function getSystemMessage({
    userId,
    accountType,
} : {
    userId?: string,
    accountType?: AccountType,
}) {
    const [marketSummary, notes] = await Promise.all([
        getFullMarketSummary(accountType === "STUDENT"? "ASX": undefined),
        userId && accountType === "PAID"? getNotesByUserID(userId): []
    ]);

    // format notes
    let notesPart = "";
    for (const note of notes) {
        notesPart += `${note.content}\n`;
    }

    switch (accountType) {
        case "STUDENT": {
            return (
`You are an enthusiastic investment advisor working for Pocket Adviser. The user is a high-school student participating in the ASX Sharemarket Game.
The Game runs for 3 months. Students receive 50,000 AUD of in-hame currency to buy and sell shares listed on the ASX. The highest performing students receive a monetary prize.
Assume the user has no prior knowledge of the stock market. Your job is to educate the user about financial and economic concepts, as well as assist them with their investments.
Today's date is ${format(new Date(), "PPPP")}.` +
(marketSummary.length > 0? `\nHere's what's been happening in the market:\n"""\n${marketSummary.trim()}\n"""`: '')
            )
        }
        default: {
            return (
`You are an enthusiastic investment advisor working for Pocket Adviser. The user is a brand-new investor who is learning how to invest in the stock market.
Assume the user has no prior knowledge of the stock market. Your job is to educate the user about financial and economic concepts, as well as assist them with their investments.
Wherever appropriate, you should refer to the user's current profile and portfolio.
Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them.
Today's date is ${format(new Date(), "PPPP")}.` +
(marketSummary.length > 0? `\nHere's what's been happening in the market:\n"""\n${marketSummary.trim()}\n"""`: '') +
(notesPart.length > 0? `\nHere are some notes about the user:\n"""\n${notesPart.trim()}\n"""\n`: '')
            )
        }
    }
}