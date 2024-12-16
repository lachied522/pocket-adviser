import type { NextRequest } from 'next/server';
import { 
    type CoreMessage,
    type Message,
    convertToCoreMessages,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

type RequestBody = {
    messages: Message[]
    userId: string
}

export async function POST(request: NextRequest) {
    const { messages, userId } = await request.json() as RequestBody;

    console.log(messages);

    const response = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(messages),
    });

    return response.toDataStreamResponse();
}