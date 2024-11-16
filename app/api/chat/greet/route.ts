import { NextResponse } from "next/server";

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { kv } from '@vercel/kv';

import { format } from 'date-fns';

import { getSystemMessage } from '../system';

function todayDate() {
    return format(new Date(), 'd_MM_yyyy');
}

async function getGreeting(): Promise<string> {
    const key = `DEFAULT_GREETING_${todayDate()}`
    const greeting = await kv.get(key);
    if (greeting) {
        return greeting as string;
    }
    // kv miss, generate new greeting
    const systemMessage = await getSystemMessage();
    const { text } = await generateText({
        model: openai('gpt-4o'),
        system: systemMessage,
        messages: [{role: "user", content: "Breifly introduce yourself and tell me what you can do. Include a sentence about the current stock market."}],
    });
    // update kv
    kv.set(key, text, { ex: 24 * 60 * 60 });
    return text;
}

export async function GET() {
    const message = await getGreeting();
    return NextResponse.json({ message });
}