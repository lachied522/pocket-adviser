import { kv } from '@vercel/kv';
import { format } from 'date-fns';

import { FinancialModellingPrepClient } from '@/utils/financial_modelling_prep/client';

import { getMarketNews } from './chat/tools/get-market-news';

const KEY = "MARKET_CONTEXT";

type ContextMap = {
    [date: string]: {
        "summary": string
        "S&P500": number
    },
}

export async function getMarketSummary() {
    const context = (await kv.get(KEY) || {}) as ContextMap;

    const today = new Date();
    const todayString = format(today, 'd_MM_yyyy');
    if (0 < today.getDay() && today.getDay() < 6 && !(todayString in context)) {
        // get market news and SPY value for today
        const client = new FinancialModellingPrepClient();
        const [query, spxQuote] = await Promise.all([
            getMarketNews("What's happening in the stock market?", 3),
            client.getQuote("^SPX"),
        ]);
        if (query && query.answer && spxQuote && spxQuote.previousClose) {
            // create copy of context
            context[todayString] = {
                "summary": query.answer,
                "S&P500": spxQuote.previousClose
            }
            // update kv
            kv.set(KEY, context);
        }
    }

    // TO DO: compact market updates into monthly summary

    return context;
}