"use server";
import { insertHolding, bulkInsertHoldings, updateHolding, deleteHolding } from "@/utils/crud/holding";
import type { Holding } from "@prisma/client";

export async function insertHoldingAction(holding: Omit<Holding, 'id'>) {
    return await insertHolding(holding);
}

export async function bulkInsertHoldingAction(holdings: Omit<Holding, 'id'>[]) {
    return await bulkInsertHoldings(holdings);
}

export async function updateHoldingAction(holding: Holding) {
    return await updateHolding(holding);
}

export async function deleteHoldingAction(holdingId: number) {
    return await deleteHolding(holdingId);
}