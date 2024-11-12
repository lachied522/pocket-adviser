import { getPrismaClient } from "./client";

import type { User } from "@prisma/client";
import type { UserData } from "@/types/helpers";

const prisma = getPrismaClient();

export async function createUser(data: Partial<User>) {
    return await prisma.user.create({
        data
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function getUserDataByUserId(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        relationLoadStrategy: "join",
        include: {
            profile: true,
            holdings: true,
            conversations: {
                select: {
                    id: true,
                    name: true,
                },
                take: 10,
                orderBy: {
                    updatedAt: 'desc',
                }
            },
        }
    });

    if (!user) return null;

    // omit unnecesary user data from return object
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        mailFrequency: user.mailFrequency,
        profile: user.profile,
        holdings: user.holdings,
        conversations: user.conversations,
    } satisfies UserData;
}

export async function updateUser(id: string, data: Partial<User>) {
    return await prisma.user.update({
        where: { id },
        data,
    })
}