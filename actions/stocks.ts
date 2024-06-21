"use server";
import { getStockById, searchStocksBySymbolAndName } from "@/utils/crud/stocks";

export async function getStockByIdAction(id: number) {
    return await getStockById(id);
}

export async function searchStocksAction(query: string) {
    const data = await searchStocksBySymbolAndName(query);
    return data;
}