"use server";
import type { NextRequest } from 'next/server';
import { convertToCoreMessages, generateId, type Message } from 'ai';
import { generateText } from 'ai';
import { MockLanguageModelV1 } from 'ai/test';


import type { AccountType, Conversation } from '@prisma/client';

import { streamAIResponse, type ToolName } from './stream-ai-response';
import { checkRateLimits } from './ratelimit';
import { updateNotes } from './notes';

import { insertConversation, updateConversation } from "@/utils/crud/conversation";
import { headers } from 'next/headers';

function convertToSafeMessages(messages: Message[]) {
    // convert to JSON-compatible array
    return [
        ...messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            data: message.data,
            createdAt: message.createdAt instanceof Date? message.createdAt.toISOString(): message.createdAt,
            toolInvocations: message.toolInvocations?.map((toolInvocation) => ({ ...toolInvocation })),
        })
    )] satisfies Conversation["messages"]
}

async function saveMessagesToConversation({
    userId,
    messages,
    conversationId,
} : {
    userId: string
    messages: Message[]
    conversationId?: string
}) {
    try {
        if (!conversationId) {
            // create new conversation record
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
        }
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

    const { text } = await generateText({
        model: new MockLanguageModelV1({
          doGenerate: async () => ({
            rawCall: { rawPrompt: null, rawSettings: {} },
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: 20 },
            text: `Hello, world!`,
          }),
        }),
        prompt: 'Hello, test!',
    });

    console.log("id", conversationId);

    const insertedConversation = await saveMessagesToConversation({
        userId,
        conversationId,
        messages: [...messages, { id: generateId(), role: "assistant", content: text }]
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            if (insertedConversation) controller.enqueue(encoder.encode(`2:${JSON.stringify([insertedConversation])}\n`));
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));

            controller.close();
        }
    });

    // const coreMessages = convertToCoreMessages(messages);

    // if (article) {
    //     coreMessages[coreMessages.length - 1].content =
    //     coreMessages[coreMessages.length - 1].content +
    //     `\n\nArticle:${JSON.stringify(article)}`;
    // }

    // const response = streamAIResponse({
    //     messages: coreMessages,
    //     toolName,
    //     userId,
    //     accountType,
    //     onFinish: (text: string) => {
    //         if (messages.length > 3 && text.length > 0 && userId && accountType === "PAID") {
    //             const _messages = convertToCoreMessages([...messages, { role: "assistant", content: text }]);
    //             updateNotes(_messages, userId);
    //         }
    //     }
    // });

    // const stream = new ReadableStream({
    //     async start(controller) {
    //         const encoder = new TextEncoder();

    //         for await (const content of response) {
    //             const queue = encoder.encode(content);
    //             controller.enqueue(queue);
    //         }

    //         controller.close();
    //     }
    // });

    return new Response(
        stream,
        {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ...(insertedConversation ? {
                    "X-Conversation-Id": insertedConversation.id,
                    "X-Conversation-Name": insertedConversation.name,
                }: {})
            },
            status: 200
        }
    );
}