"use server";

import { kv } from "@vercel/kv";

import StockDataClient from "@/utils/data/client";
import type { FXQuote } from "@/types/api";

export async function getForexPriceAction(symbol: "AUDUSD"|"USDAUD") {
    let res: FXQuote|null = await kv.get(`DATA_FX_${symbol}`);

    if (!res) {
        // get new fx rate
        const client = new StockDataClient();
        res = await client.getForexPrice(symbol);
        // update kv
        if (res) {
            kv.set(`DATA_FX_${symbol}`, res, { ex: 24 * 60 * 60 });
        }
    }

    return res;
}