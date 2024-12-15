import type { Conversation, Holding, Stock, User } from "@prisma/client";

export type ResolvedPromise<T> = T extends Promise<infer R> ? R: never;

export type UserData = (
    Pick<User, 'id'|'name'|'accountType'|'email'|'mailFrequency'|'lessons'|'dailyAdviceViewed'> &
    {
        holdings: Holding[]
        conversations: Pick<Conversation, 'id'|'name'|'updatedAt'>[]
    }
)

export type PopulatedHolding = (
    Omit<Holding, 'id'|'userId'> &
    Omit<Stock, 'id'>
)

export type FormattedTransaction = {
    stockId: number
    symbol: string
    name: string
    units: number
    price: number
    value: number
    direction: "Buy" | "Sell"
}