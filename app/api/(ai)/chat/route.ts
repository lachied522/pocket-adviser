import recursiveAICall from "./recursive-ai-call";

import type { Message } from "@/types/ai";

type RequestBody = {
    messages: Message[]
}

export async function POST(req: Request) {
    const body = await req.json() as RequestBody;

    try {
        const response = recursiveAICall({
            model: 'gpt-3.5-turbo',
            messages: body.messages,
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
    
        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            },
            status: 200
        });
    } catch (e) {
        console.error(e);
        return Response.json({}, { status: 500 });
    }
}