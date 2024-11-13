import { streamText, type CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

import { formatDollar } from '@/utils/formatting';

import type { FormattedTransaction } from './tools/get-recommendations';
import type { Profile, Stock } from '@prisma/client';

export async function continueConversation({
    system,
    prompt,
} : {
    system: string
    prompt: string
}) {
    const { textStream } = await streamText({
        model: openai('gpt-4o'),
        system,
        prompt,
    });

    return textStream;
}

export async function* handleRecommendations(
    conversation: CoreMessage[],
    result: {
        profile: any // TO DO: type this properly
        context: Stock[]
        transactions: FormattedTransaction[]
    }
) {
    /**
     * The tool result is already visible to user, so we only want LLM to explain why these were chosen.
     */

    if (result.transactions.length < 1) {
        throw new Error("No recommendations were generated");
    }

    const system = (
`You are assisting an investment-focused chatbot in providing a list of recommended transactions for the user.
You will receive a list of transactions that have been selected for the user based on a portfolio optimisation algorithm and the user's profile. 
Your task is to provide the user with some context for why these transactions are appropriate for them.\n\n
Context:\n\n"""${JSON.stringify(result.context)}"""\n\n
User's investment profile:\n\n"""${JSON.stringify(result.profile)}"""`
    );

    const prompt = (
`Recommended transactions:\n\n"""${JSON.stringify(result.transactions)}"""\n\n
Conversation history:\n\n"""${JSON.stringify(conversation)}"""`
    );

    const textStream = await continueConversation({ system, prompt });

    for await (const text of textStream) {
        yield text;
    }
}