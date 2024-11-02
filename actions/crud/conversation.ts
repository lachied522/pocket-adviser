"use server";
import { getConversationById, insertConversation, updateConversation, deleteConversation } from "@/utils/crud/conversation";
import type { Conversation } from "@prisma/client";
import type { Message } from "ai";

export async function getConversationAction(conversationId: string) {
    const res = await getConversationById(conversationId);
    return {
        ...res,
        messages: Array.isArray(res?.messages)? res?.messages: []
    }
}

export async function insertConversationAction(conversation: Omit<Conversation, 'id'|'createdAt'|'updatedAt'>) {
    return await insertConversation(conversation);
}

export async function updateConversationAction(conversationId: string, conversation: Partial<Conversation>) {
    return await updateConversation(conversationId, conversation);
}

export async function appendMessagesAction(conversationId: string, messages: Message[]) {
    const res = await getConversationAction(conversationId);
    if (!res) {
        throw new Error("Conversation not found");
    }
    return await updateConversation(
        conversationId,
        {
            messages: [
                ...res.messages,
                // convert to JSON-compatible array
                ...messages.map(
                    (message) => ({
                        id: message.id,
                        role: message.role,
                        content: message.content,
                        data: message.data,
                        createdAt: message.createdAt?.toISOString(),
                        toolInvocations: message.toolInvocations?.map((toolInvocation) => ({ ...toolInvocation })),
                    })
                )
            ]
        }
    );
}

export async function deleteConversationAction(conversationId: string) {
    return await deleteConversation(conversationId);
}