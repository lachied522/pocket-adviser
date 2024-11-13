import type { Conversation, Holding, Profile, Stock, User } from "@prisma/client";

export type ResolvedPromise<T> = T extends Promise<infer R> ? R: never;

export type Milestone = {
    date: Date,
    target: number,
    description: string,
}

export type UserData = (
    Pick<User, 'id'|'name'|'accountType'|'email'|'mailFrequency'> & {
        profile: Profile | null
        holdings: Holding[]
        conversations: Pick<Conversation, 'id'|'name'>[]
    }
)

export type PopulatedHolding = (
    Holding & Omit<Stock, 'id'>
)

