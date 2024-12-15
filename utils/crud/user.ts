import { getPrismaClient } from "./client";

import { Prisma, type User, type Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

const prisma = getPrismaClient();

export async function createUser(data: Partial<User>) {
    return await prisma.user.create({
        data: {
            ...data,
            lessons: data.lessons ?? Prisma.JsonNull
        },
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function updateUser(id: string, data: Partial<User>) {
    return await prisma.user.update({
        where: { id },
        data: {
            ...data,
            lessons: data.lessons ?? Prisma.JsonNull
        },
    })
}

export async function getProfileByUserId(userId: string) {
    return await prisma.profile.findUnique({
        where: { userId }
    });
}

export async function getHoldingsByUserId(userId: string) {
    return await prisma.holding.findMany({
        where: { userId },
        include: {
            stock: true,
        }
    });
}

export async function getDataByUserId(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        relationLoadStrategy: "join",
        include: {
            holdings: {
                include: {
                    stock: {
                        select: {
                            id: true,
                            symbol: true,
                            previousClose: true,
                            currency: true,
                        }
                    }
                },
            },
            conversations: {
                select: {
                    id: true,
                    name: true,
                    updatedAt: true,
                },
                take: 20,
                orderBy: {
                    updatedAt: 'desc',
                }
            },
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // omit unnecesary user data from return object
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        mailFrequency: user.mailFrequency,
        dailyAdviceViewed: user.dailyAdviceViewed,
        holdings: user.holdings.map((holding) => ({
            id: holding.id,
            units: holding.units,
            stockId: holding.stockId,
            userId: holding.userId,
        })),
        conversations: user.conversations,
        lessons: user.lessons,
    } satisfies UserData;

    const stockData = user.holdings.reduce(
        (acc, obj) => ({ ...acc, [obj.stock.id]: obj.stock }),
        {}
    );

    return { userData, stockData };
}