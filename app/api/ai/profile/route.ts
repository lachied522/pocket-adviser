import type { NextRequest } from 'next/server';
import { 
    type CoreMessage,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

type RequestBody = {
}

export async function POST(request: NextRequest) {
    const { } = await request.json() as RequestBody;

    const prompt = "Hi there";

    const response = await streamText({
        model: openai('gpt-4o'),
        prompt,
    });

    return response.toDataStreamResponse();
}