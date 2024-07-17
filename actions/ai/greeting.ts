import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { kv } from '@vercel/kv';

import { getSystemMessage } from './system';

import type { UserData } from '@/types/helpers';

// async generator function to give appearance of streaming a cached response
async function* asyncTextGenerator(text: string, pieceLength: number, interval: number = 1000): AsyncGenerator<string> {
    for (let i = 0; i < text.length; i += pieceLength) {
        await new Promise(resolve => setTimeout(resolve, interval));
        yield text.slice(i, i + pieceLength);
    }
}
  
export async function getGreeting(user: UserData|null) {
    let greeting = await kv.get("DEFAULT_GREETING");
    if (greeting) {
        console.log('cache hit')
        // const textStream = asyncTextGenerator(greeting as string, 5);
        // for await (const text of textStream) {
        //     yield text;
        // }
        return greeting;
    }
    // kv miss, generate new greeting
    const systemMessage = await getSystemMessage();
    const { textStream } = await streamText({
        model: openai('gpt-4o'),
        system: systemMessage,
        messages: [{role: "user", content: "Hello! Breifly introduce yourself and tell me what you can do. Include a sentence about the current stock market."}],
    });
    // stream greeting back and store full result in kv
    greeting = "";
    for await (const text of textStream) {
        greeting += text;
    }
    // update kv
    kv.set("DEFAULT_GREETING", greeting, { ex: 24 * 60 * 60 });
    return greeting;
}