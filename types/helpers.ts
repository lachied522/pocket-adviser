import type { Holding, Profile, Stock, User } from "@prisma/client";

export type ResolvedPromise<T> = T extends Promise<infer R> ? R: never;

export type UserData = (
    Pick<User, 'id'|'name'|'email'> & {
        profile: Profile | null
        holdings: Holding[]
    }
)

export type PopulatedHolding = (
    Holding & Omit<Stock, 'id'>
)

export type Recommendation = {
    stockId: number
    transaction: "Buy"|"Sell"
    symbol: string
    name: string
    units: number
    price: number
    value: number
}