"use server";
import { getStockBySymbol, searchStocksBySymbolAndName } from "@/utils/crud/stocks";

export async function getStock(symbol: string) {
    return await getStockBySymbol(symbol.toLowerCase());
}

export async function searchStocks(query: string) {
    const data = await searchStocksBySymbolAndName(query);
    console.log(data);
    return data;
}