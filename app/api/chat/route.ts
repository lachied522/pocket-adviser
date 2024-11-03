"use server";
import type { NextRequest } from 'next/server';
import { convertToCoreMessages, type Message } from 'ai';

import type { AccountType } from '@prisma/client';

import { streamAIResponse, type ToolName } from './stream-ai-response';
import { checkRateLimits } from './ratelimit';
import { updateNotes } from './notes';

type RequestBody = {
    messages: Message[]
    article: any
    toolName?: ToolName
    userId?: string
    accountType?: AccountType
}

export async function POST(request: NextRequest) {
    const { messages, article, toolName, userId, accountType } = await request.json() as RequestBody;

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

    const coreMessages = convertToCoreMessages(messages);

    if (article) {
        coreMessages[coreMessages.length - 1].content =
        coreMessages[coreMessages.length - 1].content +
        `\n\nArticle:${JSON.stringify(article)}`;
    }

    const response = streamAIResponse({
        messages: coreMessages,
        toolName,
        userId,
        accountType,
        onFinish: (text: string) => {
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
                "Content-Type": "text/plain; charset=utf-8"
            },
            status: 200
        }
    );
}