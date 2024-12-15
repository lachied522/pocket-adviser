import { getPrismaClient } from "./client";

import type { Advice } from "@prisma/client";

const prisma = getPrismaClient();

export async function getAdviceById(id: number) {
    return await prisma.advice.findUnique({
        where: { id }
    });
}

export async function getAdviceByUserId(
    userId: string,
    take?: number
) {
    return await prisma.advice.findMany({
        where: { userId },
        take,
        orderBy: {
            createdAt: 'desc',
        }
    });
}

export async function insertAdvice(data: Omit<Advice, 'id'|'createdAt'>) {
    return await prisma.advice.create({
        data,
    })
}