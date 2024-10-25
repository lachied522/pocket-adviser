
import { Prisma, type Profile } from "@prisma/client";
import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function updateProfile(data: Profile) {
    // check if user already has profile
    const profile = await prisma.profile.findUnique({
        where: { userId: data.userId }
    });

    if (profile) {
        // update existing profile
        return await prisma.profile.update({
            where: {
                userId: data.userId,
            },
            data: {
                ...data,
                preferences: data.preferences ?? Prisma.JsonNull,
                milestones: data.milestones ?? Prisma.JsonNull,
            },
        })
    }

    return await prisma.profile.create({
        data: {
            ...data,
            preferences: data.preferences ?? Prisma.JsonNull,
            milestones: data.milestones ?? Prisma.JsonNull,
        }
    });
}