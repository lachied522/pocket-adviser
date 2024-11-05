import { Prisma, type Conversation } from "@prisma/client";

import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function insertConversation(data: Omit<Conversation, 'id'|'createdAt'|'updatedAt'>) {
    return await prisma.conversation.create({
        data: {
            ...data,
            messages: data.messages  || Prisma.JsonNull,
        }
    });
}

export async function getConversationById(id: string) {
    return await prisma.conversation.findUnique({
        where: { id },
    });
}

export async function getConversationsByUserId(userId: string, page: number = 0, take: number = 10) {
    return await prisma.conversation.findMany({
        where: { userId },
        select: {
            id: true,
            name: true
        },
        orderBy: {
            updatedAt: 'desc',
        },
        skip: page * take,
        take,
    });
}

export async function updateConversation(
    id: string,
    data: Partial<Conversation>
) {
    return await prisma.conversation.update({
        where: { id },
        data: {
            name: data.name,
            updatedAt: new Date().toISOString(),
            ...(data.messages? { messages: data.messages || Prisma.JsonNull }: {}),
        },
    });
}

export async function deleteConversation(
    id: string,
) {
    return await prisma.conversation.delete({
        where: { id },
    });
}