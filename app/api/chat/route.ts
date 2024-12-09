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

import { insertConversation, updateConversation } from "@/utils/crud/conversation";

function convertTextToMessage(content: string) {
    return { id: generateId(), role: "assistant" as const, content } satisfies Message;
}

function convertToolCallsToMessages({
    toolCalls,
    toolResults,
} : {
    toolCalls: ToolCallPart[]
    toolResults: ToolResultPart[]
}) {
    // see https://github.com/vercel/ai-chatbot/blob/00b125378c998d19ef60b73fe576df0fe5a0e9d4/lib/utils.ts
    const messages: Message[] = [];

    for (const toolCall of toolCalls) {
        const resultPart = toolResults.find((toolResult) => toolResult.toolCallId === toolCall.toolCallId);

        if (resultPart) {
            messages.push({
                id: generateId(),
                role: "assistant" as const,
                content: '',
                toolInvocations: [
                    {
                        ...toolCall,
                        result: resultPart?.result,
                        state: "result"
                    },
                ]
            });
        }
    }

    return messages;
}

function convertToSafeMessages(messages: Message[]) {
    // convert to JSON-compatible array
    return [
        ...messages.map((message) => ({
            id: generateId(),
            role: message.role,
            content: message.content,
            data: message.data,
            createdAt: message.createdAt instanceof Date? message.createdAt.toISOString(): message.createdAt,
            toolInvocations: message.toolInvocations?.map((toolInvocation) => ({ ...toolInvocation })),
        })
    )] satisfies Conversation["messages"];
}

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
            messages: convertToSafeMessages(messages),
        });
        return {
            id: res.id,
            name: res.name,
        }
    } catch (e) {
        console.error(e);
    }
}

async function saveConversation({
    conversationId,
    messages,
} : {
    conversationId: string
    messages: Message[]
}) {
    try {
        // update existing conversation
        await updateConversation(
            conversationId,
            { messages: convertToSafeMessages(messages) }
        ); 
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

    let newConversationId: string;
    let extraHeaders: { [key: string]: string } = {};
    if (accountType !== "GUEST" && !conversationId) {
        const res = await createNewConversation({ userId, messages });
        if (res) {
            newConversationId = res.id;
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
            finishReason,
            toolCalls,
            toolResults,
        } : {
            text: string
            finishReason: FinishReason
            toolCalls: ToolCallPart[]
            toolResults: ToolResultPart[]
        }) => {
            if (accountType !== "GUEST" && finishReason !== "error") {
                const _messages = [
                    ...messages,
                    ...(toolCalls.length > 0? convertToolCallsToMessages({ toolCalls, toolResults }): []),
                    ...(text.length > 0? [convertTextToMessage(text)]: []),
                ];

                saveConversation({
                    conversationId: conversationId || newConversationId,
                    messages: _messages,
                });
    
                if (_messages.length > 3 && text.length > 0 && userId && accountType === "PAID") {
                    updateNotes(convertToCoreMessages(_messages), userId);
                }
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