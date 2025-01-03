import { kv } from "@vercel/kv";
import { PrismaClient } from '@prisma/client';

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import type { EarningsEvent, EconomicsEvent } from "@/utils/financial_modelling_prep/types";

// key for data in kv store
const KEY = "DATA_CALENDAR";

async function fetchEarningsData(
    from: Date,
    to: Date,
    client: FinancialModellingPrepClient
) {
    // only want to return earnings events for symbols in the universe
    // Step 1: fetch all symbols in universe
    const prisma = new PrismaClient();
    const records = await prisma.stock.findMany({
        select: {
            symbol: true,
        }
    });
    const allSymbols = records.map((obj) => obj.symbol);
    // Step 2: fetch earnings calendar
    const data = await client.getEarningsCalendar(from, to);
    // Step 3: filter earnings data and return
    return data.filter((obj) => allSymbols.includes(obj.symbol));
}

async function fetchEcononmicsData(
    from: Date,
    to: Date,
    client: FinancialModellingPrepClient,
    countryCodes = ["AU", "US"],
) {
    const data = await client.getEconomicsCalendar(from, to);
    return data.filter((obj) => countryCodes.includes(obj.country));
}

export type Calendar = (EarningsEvent|EconomicsEvent)[];

export async function getCalendar(symbols: string[]) {
    // check kv
    let allEvents: Calendar|null = await kv.get(KEY);

    if (!allEvents) {
        // kv miss, fetch new data
        const from = new Date();
        const to = new Date();
        to.setMonth(from.getMonth() + 3);

        const client = new FinancialModellingPrepClient();

        const [earningsData, economicsData] = await Promise.all([
            fetchEarningsData(from, to, client),
            fetchEcononmicsData(from, to, client),
        ]);

        allEvents = [
            ...earningsData,
            ...economicsData
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // update kv with expiry of 1 month
        kv.set(KEY, allEvents, { ex: 31 * 24 * 60 * 60 });
    }

    // filter for symbols and current date, and limit to 24
    const today = new Date();
    return allEvents.filter((obj) => {
        if ('symbol' in obj) {
            return symbols.includes(obj.symbol);
        }
        return true;
    })
    .filter((obj) => new Date(obj.date).getTime() > today.getTime())
    .slice(0, 24);
}
