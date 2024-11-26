"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useChat } from 'ai/react';
import { generateId, type Message } from 'ai';

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { StockNews } from "@/types/data";

export type ChatState = {
    input: string
    article: StockNews
    messages: Message[]
    isLoading: boolean
    error?: Error
    setInput: React.Dispatch<React.SetStateAction<string>>
    setArticle: React.Dispatch<React.SetStateAction<StockNews|null>>
    onSubmit: (content: string, tool?: string) => void
}

const ChatContext = createContext<any>(null);

export const useChatContext = () => {
  return useContext(ChatContext);
}

interface ChatProviderProps {
    children: React.ReactNode
    initialConversationId?: string
    conversationHistory?: Message[]
    initialUserMessage?: string
}

export function ChatProvider({
    children,
    initialConversationId,
    conversationHistory,
    initialUserMessage
}: ChatProviderProps) {
    const { state, insertConversation } = useGlobalContext() as GlobalState;
    const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId); // id of conversation in db
    const [article, setArticle] = useState<StockNews|null>(null);
    const { messages, input, isLoading, error, setInput, append } = useChat({
        initialMessages: conversationHistory,
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {
            userId: state.id,
            userName: state.name,
            accountType: state.accountType,
            conversationId,
        },
        onResponse(response: Response) {
            // if a new conversation is started,
            // the conversation id and name are returned in response headers
            const _conversationId = response.headers.get("X-Conversation-Id");
            const _conversationName = response.headers.get("X-Conversation-Name");
            if (_conversationId) {
                setConversationId(_conversationId);
                insertConversation({
                    id: _conversationId,
                    name: _conversationName ?? "New Conversation",
                    updatedAt: new Date(),
                });
                // update route without triggering refresh
                window.history.pushState(null, '', `/c/${_conversationId}`);
            }
        }
    });

    useEffect(() => {
        // trigger chat submission if initial user message exists
        if (initialUserMessage && !isLoading) {
            // want to check that this message is not already in conversation history
            append({ id: generateId(), role: "user", content: initialUserMessage });
        }
    }, [initialUserMessage]);

    const onSubmit = useCallback(
        async (content: string, toolName?: string) => {
            if (isLoading) return;
            const message = {
                id: generateId(),
                role: "user" as const,
                data: { article },
                content,
            }
            append(message, { body: { toolName, article } });
            setArticle(null);
            setInput('');
        },
        [isLoading, conversationId, article, setInput, setArticle, append]
    );

    return (
        <ChatContext.Provider
            value={{
                input,
                article,
                messages,
                isLoading,
                error,
                setInput,
                setArticle,
                onSubmit,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}