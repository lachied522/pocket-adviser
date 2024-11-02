import type { Conversation, Holding, Profile, Stock, User } from "@prisma/client";

export type ResolvedPromise<T> = T extends Promise<infer R> ? R: never;

export type Milestone = {
    date: Date,
    target: number,
    description: string,
}

export type UserData = (
    User & {
        profile: Profile | null
        holdings: Holding[]
        conversations: Pick<Conversation, 'id'|'name'>[]
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