import { Prisma, type Conversation } from "@prisma/client";

import { getPrismaClient } from "./client";

const prisma = getPrismaClient();

export async function insertConversation(data: Omit<Conversation, 'id'|'createdAt'>) {
    return await prisma.conversation.create({
        data: {
            ...data,
            messages: data.messages || Prisma.JsonNull,
        }
    });
}

export async function getConversationById(id: string) {
    return await prisma.conversation.findUnique({
        where: { id },
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
            ...(data.messages? {messages: data.messages || Prisma.JsonNull}: {}),
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