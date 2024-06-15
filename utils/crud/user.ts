import type { User } from "@prisma/client";

import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function createUser(data: any) {
    return await prisma.user.create({
        data
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        relationLoadStrategy: "join",
        include: {
            profile: true,
            holdings: true,
        }
    });
}