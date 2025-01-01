import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { kv } from '@vercel/kv';

import {
    format,
    parse,
    isValid,
    isAfter,
    isBefore,
    startOfMonth,
    endOfMonth,
    subMonths,
    compareDesc
} from 'date-fns';

import { FinancialModellingPrepClient } from '@/utils/financial_modelling_prep/client';

import { getMarketNews } from './chat/tools/get-market-news';

type DateSummaryMap = {
    // date in "d_MM_yyyy" format
    [date: string]: {
        summary: string
        index?: number
    },
}

function isTradingDay(date: Date) {
    // TO DO: include non-trading holidays etc
    return 0 < date.getDay() && date.getDay() < 6;
}

function isWithinCalendarMonthRange(
    date: Date,
    n: number = 1 // n months ago
) {
    const today = new Date();
    const startOfLastMonth = startOfMonth(subMonths(today, n));
    const endOfLastMonth = endOfMonth(subMonths(today, n));
    return isAfter(date, startOfLastMonth) && isBefore(date, endOfLastMonth);
}

async function getDailySummary(exchange?: "ASX"|"NASDAQ") {
    try {
    
        const searchResults = await Promise.all([
            getMarketNews(`What's happening in the${exchange === "ASX"? " ASX": ''} stock market?`, 3),
            getMarketNews(`What factors are influencing the${exchange === "ASX"? " ASX": ''} stock market?`, 3),
            getMarketNews(`What is the latest economic news${exchange === "ASX"? " in Australia": ''}?`, 3),
            getMarketNews(`What is the stock market outlook${exchange === "ASX"? " in Australia": ''}?`, 3),
            getMarketNews(`What are investors thinking about this week?`, 3),
        ]);

        if (searchResults.filter((result) => !!result).length < 1) {
            throw new Error("Search results were null");
        }

        const { text } = await generateText({
            model: openai("gpt-4o"),
            system: (
    `You are an intelligent investment adviser. 
    Use this information to answer the user's query.\n\n${JSON.stringify(searchResults)}`
            ),
            prompt: `What's happening in the stock market? Use 200 words.`,
        });

        return { summary: text };
    } catch (e) {
        console.error("Error getting daily summary: ", e);
        return null;
    }
}

function sortSummaries(summaries: DateSummaryMap) {
    const parsedEntries = Object.entries(summaries).map(([key, value]) => {
        return { key, value, date: parse(key, "d_MM_yyyy", new Date()) };
    });

    return Object.fromEntries(
        Object.values(parsedEntries).sort((a, b) => {
            return compareDesc(a.date, b.date);
        })
        .map(({ key, value }) => [key, value])
    );
}

async function generateMonthlySummary(lastMonthEntries: DateSummaryMap, monthName: string) {
    const { text } = await generateText({
        model: openai("gpt-4o"),
        system: (
`Below are day-by-day summaries of the what happened in the stock market over the month of ${monthName}. 
Use this information to answer the user's query.\n\n${JSON.stringify(lastMonthEntries)}`
        ),
        prompt: `What happened in the stock market in the month of ${monthName}? Use 200 words.`,
    });

    return text;
}

async function getCompactedSummary(summaries: DateSummaryMap) {
    try {
        // check if the last entry is within last calendar month
        // if so, combine all entries of last month into one using LLM
        const sortedSummaries = sortSummaries(summaries);
        const [lastEntryDate, lastEntryValue] = Object.entries(sortedSummaries)[0];

        if (isWithinCalendarMonthRange(parse(lastEntryDate, "d_MM_yyyy", new Date()), 1)) {
            // get all daily summaries from within last month
            const dailySummaries = Object.entries(sortedSummaries)
            .reduce((acc, [key, value]) => {
                    const date = parse(key, "d_MM_yyyy", new Date());
                    if (isValid(date) && isWithinCalendarMonthRange(date, 1)) {
                        return { ...acc, [key]: value };
                    }
                    return acc;
                },
                {}
            ) as DateSummaryMap;

            const date = endOfMonth(subMonths(new Date(), 1));
            const monthlySummary = await generateMonthlySummary(dailySummaries, format(date, "MMMM"));

            // insert new entry
            const lastMonthString = format(date, "d_MM_yyyy");
            sortedSummaries[lastMonthString] = {
                summary: monthlySummary,
                index: lastEntryValue.index,
            }

            // remove daily entries from last month
            for (const key in dailySummaries) {
                delete sortedSummaries[key];
            }
        }

        return sortedSummaries;
    } catch (e) {
        console.error("Could not generate compacted market summary: ", e);
        return summaries;
    }
}

async function updateMarketSummary(summaries: DateSummaryMap, exchange?: "ASX"|"NASDAQ") {
    const [dailySummary, compactedSummaries] = await Promise.all([
        getDailySummary(exchange),
        getCompactedSummary(summaries)
    ]);

    if (dailySummary) {
        const todayString = format(new Date(), "d_MM_yyyy");
        compactedSummaries[todayString] = dailySummary;
    }

    return compactedSummaries;
}

function formatMarketSummary(summaries: DateSummaryMap) {
    // format to make it readable for LLM
    let summaryString = "";
    for (const [dateString, { summary, index }] of Object.entries(summaries)) {
        const date = parse(dateString, "d_MM_yyyy", new Date());
        if (isWithinCalendarMonthRange(date, 0)) {
            // if date is from this calendar month,
            // format Friday, April 29th, 1453
            summaryString += `${format(date, "EEEE, MMMM d")}: ${summary.split('\n').join(' ')}\n\n`;
        } else {
            // format month name only
            summaryString += `${format(date, "MMMM")}: ${summary.split('\n').join(' ')}\n\n`;
        }
    }

    return summaryString.trim();
}

export async function getFullMarketSummary(exchange?: "ASX"|"NASDAQ") {
    const key = `MARKET_SUMMARY_${exchange ?? "NASDAQ"}`;

    let summaries = (await kv.get(key) || {}) as DateSummaryMap;

    const today = new Date();
    const todayString = format(today, "d_MM_yyyy");
    if (!(todayString in summaries) && isTradingDay(today)) {
        summaries = await updateMarketSummary(summaries, exchange);
        kv.set(key, summaries);
    }

    return formatMarketSummary(summaries);
}

export async function getTodayMarketSummary(exchange?: "ASX"|"NASDAQ") {
    const key = `MARKET_SUMMARY_${exchange ?? "NASDAQ"}`;
    let summaries = (await kv.get(key) || {}) as DateSummaryMap;

    const todayString = format(new Date(), "d_MM_yyyy");
    if (!(todayString in summaries)) {
        summaries = await updateMarketSummary(summaries, exchange);
        kv.set(key, summaries);
    }

    return summaries[todayString].summary;
}