
import { Prisma, type Profile } from "@prisma/client";
import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function getProfileByUserId(userId: string) {
    // check if user already has profile
    return await prisma.profile.findUnique({
        where: { userId }
    });
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
    // check if user already has profile
    const profile = await prisma.profile.findUnique({
        where: { userId }
    });

    if (profile) {
        // update existing profile
        return await prisma.profile.update({
            where: { userId },
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
            userId,
        }
    });
}