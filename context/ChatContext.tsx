"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
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
    onReset: () => void
}

const ChatContext = createContext<any>(null);

export const useChatContext = () => {
  return useContext(ChatContext);
}

interface ChatProviderProps {
    children: React.ReactNode
}

export function ChatProvider({
  children,
}: ChatProviderProps) {
    const { state } = useGlobalContext() as GlobalState;
    const [chatId, setChatId] = useState<number>(0);
    const [article, setArticle] = useState<StockNews|null>(null);
    const [shouldAutoRespondToToolCall, setShouldAutoRespondToToolCall] = useState<boolean>(true);
    const { messages, input, isLoading, error, setInput, append, addToolResult } = useChat({
        id: chatId.toString(),
        initialMessages: chatId < 1? [{ id: generateId(), role: "assistant", content: "Hello!" }]: [],
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {
            userId: state?.id,
            shouldAutoRespondToToolCall,
        },
        onToolCall({ toolCall }) {
            if (toolCall.toolName === "getPortfolio") {
                // addToolResult({
                //     toolCallId: toolCall.toolCallId,
                //     result: state?.holdings,
                // })
            }
        }
    });

    const onSubmit = useCallback(
        async (content: string, toolName?: string) => {
            if (isLoading) return;

            if (toolName === 'getRecommendations' || toolName === 'shouldBuyOrSellStock') {
                setShouldAutoRespondToToolCall(false);
            } else {
                setShouldAutoRespondToToolCall(true);
            }

            setInput('');
            setArticle(null);
            append({ role: 'user', content, data: { article } }, { body: { toolName, article } });
        },
        [isLoading, article, setInput, setArticle, append]
    );

    const onReset = useCallback(
        async () => {
            setChatId((curr) => curr + 1);
            setInput('');
            setArticle(null);
        },
        [setChatId, setInput, setArticle]
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
                onReset,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}