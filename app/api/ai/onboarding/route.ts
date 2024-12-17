import type { NextRequest } from 'next/server';
import { 
    type CoreMessage,
    type Message,
    convertToCoreMessages,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

const SYSTEM_MESSAGE = (
`You are an enthusiastic investment advisor working for Pocket Adviser. The user is a brand-new investor who you are currently helping complete their investment profile. Assume the user has no prior knowledge of the stock market.`
)

type RequestBody = {
    messages: CoreMessage[]
    userId: string
}

export async function POST(request: NextRequest) {
    const { messages, userId } = await request.json() as RequestBody;

    console.log(messages);

    const response = await streamText({
        model: openai('gpt-4o'),
        system: SYSTEM_MESSAGE,
        messages,
    });

    return response.toDataStreamResponse();
}