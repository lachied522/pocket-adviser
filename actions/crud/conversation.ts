"use server";
import { getConversationById, insertConversation, updateConversation, deleteConversation } from "@/utils/crud/conversation";
import type { Conversation } from "@prisma/client";

export async function getConversationAction(conversationId: string) {
    return await getConversationById(conversationId);
}

export async function insertConversationAction(conversation: Omit<Conversation, 'id'>) {
    return await insertConversation(conversation);
}

export async function updateConversationAction(conversationId: string, conversation: Partial<Conversation>) {
    return await updateConversation(conversationId, conversation);
}

export async function appendMessagesAction(conversationId: string, messages: Pick<Conversation, 'messages'>) {
    const res = await getConversationById(conversationId);
    if (!res) {
        throw new Error("Conversation not found");
    }

    return await updateConversation(
        conversationId,
        {
            // @ts-ignore
            messages: [...res.messages, ...messages]
        }
    );
}

export async function deleteConversationAction(conversationId: string) {
    return await deleteConversation(conversationId);
}