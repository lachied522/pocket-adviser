"use server";
import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

export async function getStockBySymbolAction(
    symbol: string,
) {
    return await new FinancialModellingPrepClient().getCompanyOutlook(symbol.toUpperCase());
}