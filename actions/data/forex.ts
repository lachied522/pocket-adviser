"use server";
import { kv } from "@vercel/kv";

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import type { FXQuote } from "@/utils/financial_modelling_prep/types";

export async function getForexRateAction(symbol: "AUDUSD") {
    let res: FXQuote | null = await kv.get(`DATA_FX_${symbol}`);
    if (!res) {
        res = await new FinancialModellingPrepClient().getForexPrice(symbol);
        // update kv 
        kv.set(`DATA_FX_${symbol}`, res, { ex: 24 * 60 * 60 });
    }
    // return average of bid & ask
    return res? (parseFloat(res.bid) + parseFloat(res.ask)) / 2: 1;
}