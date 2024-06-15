
import recursiveAICall from './recursive-ai-call';

type RequestBody = {
    messages: any
    tools: any
}

export async function POST(req: Request) {
    try {
        const { messages, tools } = await req.json() as RequestBody;

        if (tools) {
            console.log(tools);
            return;
        }

        const response = recursiveAICall({
            model: 'gpt-3.5-turbo',
            messages: messages,
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