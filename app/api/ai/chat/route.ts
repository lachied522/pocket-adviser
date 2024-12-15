"use server";
import type { NextRequest } from 'next/server';
import {
    type Message,
    type ToolCallPart,
    type ToolResultPart,
    type FinishReason,
    type LanguageModelUsage,
    convertToCoreMessages,
    generateId,
} from 'ai';

import type { AccountType, Conversation } from '@prisma/client';

import { streamAIResponse, type ToolName } from './stream-ai-response';
import { checkRateLimits } from './ratelimit';
import { updateNotes } from './notes';

import { insertConversation } from "@/utils/crud/conversation";

async function createNewConversation({
    userId,
    messages,
} : {
    userId: string
    messages: Message[]
}) {
    try {
        const name = messages.filter((message) => message.role === "user")?.[0].content?.slice(0, 50) ?? "New conversation";
        const res = await insertConversation({
            userId,
            name,
            messages,
        });

        return {
            id: res.id,
            name: res.name,
        }
    } catch (e) {
        console.error(e);
    }
}

type RequestBody = {
    messages: Message[]
    article?: any
    toolName?: ToolName
    conversationId?: string
    userId: string
    accountType: AccountType
}

export async function POST(request: NextRequest) {
    const { messages, article, toolName, conversationId, userId, accountType } = await request.json() as RequestBody;

    // check rate limit
    const rateLimitMessage = await checkRateLimits(userId, accountType);
    if (rateLimitMessage) {
        return new Response(
            new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder();
                    const queue = encoder.encode(`0:${JSON.stringify(rateLimitMessage)}\n`);
                    controller.enqueue(queue);
                    controller.close();
                }
            }),
            {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8"
                },
                status: 200
            }
        );
    }

    let extraHeaders: { [key: string]: string } = {};
    if (accountType !== "GUEST" && !conversationId) {
        const res = await createNewConversation({ userId, messages });
        if (res) {
            extraHeaders = {
                "X-Conversation-Id": res.id,
                "X-Conversation-Name": res.name,
            }
        }
    }

    const coreMessages = convertToCoreMessages(messages);

    if (article) {
        coreMessages[coreMessages.length - 1].content += `\n\nArticle:${JSON.stringify(article)}`;
    }

    const response = streamAIResponse({
        messages: coreMessages,
        toolName,
        userId,
        accountType,
        onFinish: ({
            text,
        } : {
            text: string
        }) => {
            if (messages.length > 3 && text.length > 0 && userId && accountType === "PAID") {
                const _messages = convertToCoreMessages([...messages, { role: "assistant", content: text }]);
                updateNotes(_messages, userId);
            }
        }
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            for await (const content of response) {
                const queue = encoder.encode(content);
                controller.enqueue(queue);
            }

            controller.close();
        }
    });

    return new Response(
        stream,
        {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ...extraHeaders,
            },
            status: 200
        }
    );
}