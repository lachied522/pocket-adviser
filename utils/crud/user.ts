import { getPrismaClient } from "./client";

import type { User, Stock } from "@prisma/client";
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

export async function updateUser(id: string, data: Partial<User>) {
    return await prisma.user.update({
        where: { id },
        data,
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
            profile: true,
            holdings: {
                include: { stock: true },
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

    const userData: UserData = {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        mailFrequency: user.mailFrequency,
        profile: user.profile,
        holdings: user.holdings.map((holding) => ({
            id: holding.id,
            units: holding.units,
            stockId: holding.stockId,
            userId: holding.userId,
        })),
        conversations: user.conversations,
    };

    const stockData: { [id: number]: Stock } = user.holdings.reduce((acc, obj) => ({ ...acc, [obj.stock.id]: obj.stock }), {});

    // omit unnecesary user data from return object
    return { userData, stockData };
}