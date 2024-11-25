"use server";
import { getConversationById, getConversationsByUserId, insertConversation, updateConversation, deleteConversation } from "@/utils/crud/conversation";
import type { Conversation } from "@prisma/client";
// import type { Message } from "ai";

export async function getConversationAction(conversationId: string) {
    const res = await getConversationById(conversationId);
    return {
        ...res,
        messages: Array.isArray(res?.messages)? res?.messages: []
    }
}

export async function getMoreConversationsAction(userId: string, page: number = 0, take: number = 10) {
    return await getConversationsByUserId(userId, page, take);
}

export async function insertConversationAction(conversation: Omit<Conversation, 'id'|'createdAt'|'updatedAt'>) {
    return await insertConversation(conversation);
}

export async function updateConversationAction(conversationId: string, conversation: Partial<Conversation>) {
    return await updateConversation(conversationId, conversation);
}

export async function deleteConversationAction(conversationId: string) {
    return await deleteConversation(conversationId);
}