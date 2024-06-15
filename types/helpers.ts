import type { Holding, Profile, Stock, User } from "@prisma/client";

export type PopulatedHolding = (
    Holding & Stock
)

export type UserData = (
    Pick<User, 'id'|'name'|'email'> & {
        profile: Profile | null
        holdings: Holding[]
    }
)