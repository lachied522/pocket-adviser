import { generateId } from 'ai';

import { PrismaClient } from '@prisma/client';

import { AI, type ClientMessage, type ServerMessage } from '@/actions/ai/chat';
import { ChatProvider } from '@/context/ChatContext';

import { MessageWithRecommendations } from '@/components/chat/messages';

import type { Recommendation } from "@/types/helpers";

async function getAdviceById(id: number, userId: string) {
    const prisma = new PrismaClient();
    return await prisma.advice.findUnique({
        where: { id, userId }
    });
}

interface AIProviderProps {
    children: React.ReactNode
    userId?: string
    adviceId?: number // id of advice record to populate initial UI state
}

export async function AIProvider({
    children,
    userId,
    adviceId,
} : AIProviderProps) {
    let initialAIState: ServerMessage[] = [];
    let initialUIState: ClientMessage[] = [];

    if (adviceId && userId) {
        // populate UI state with advice record
        const data = await getAdviceById(adviceId, userId);
        if (data) {
            initialUIState.push({
                id: generateId(),
                role: 'assistant',
                display: <MessageWithRecommendations
                    content="Please note that these are not formal recommendations. Please contact a financial adviser if you require advice, however feel free to ask any questions you may have. 🙂"
                    data={{
                        ...data,
                        transactions: data.transactions as Recommendation[]
                    }}
                />,
            });
        }
    }

    return (
        <AI initialAIState={initialAIState} initialUIState={initialUIState}>
            <ChatProvider>
                {children}
            </ChatProvider>
        </AI>
    )
}