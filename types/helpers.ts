import type { Holding, Stock } from "@prisma/client";

export type PopulatedHolding = (
    Holding & Stock
)