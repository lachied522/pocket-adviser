import { kv } from "@vercel/kv";

import StockDataClient from "./client";

import type { FXQuote } from "@/types/data";

export async function getForexRate(symbol: "AUDUSD"|"USDAUD") {
    let res: FXQuote|null = await kv.get(`DATA_FX_${symbol}`);
    if (!res) {
        const client = new StockDataClient();
        res = await client.getForexPrice(symbol);
        // update kv 
        kv.set(`DATA_FX_${symbol}`, res, { ex: 24 * 60 * 60 });
    }
    // return average of bid & ask
    return res? (parseFloat(res.bid) + parseFloat(res.ask)) / 2: 1;
}