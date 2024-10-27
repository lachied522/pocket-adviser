"use server";
import type { NextRequest } from 'next/server';
import { recursiveTextStream } from './recursive-text-stream';
import { checkRateLimits } from './ratelimit';

export async function POST(request: NextRequest) {
    const { messages, article, toolName, userId, accountType } = await request.json();

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

    if (article) {
        messages[messages.length - 1].content =
        messages[messages.length - 1].content +
        `\n\nArticle:${JSON.stringify(article)}`;
    }

    const response = recursiveTextStream(messages, toolName, userId);

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

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        status: 200
    });
}