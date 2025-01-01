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

import { updateConversationAction } from "@/actions/crud/conversation";

import { extractConversationIdFromPathname } from "@/hooks/useChatNavigation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { StockNews } from "@/utils/financial_modelling_prep/types";
import type { Conversation } from "@prisma/client";

function getJSONCompatibleMessages(messages: Message[]) {
    return [
        ...messages.map((message) => ({
            id: generateId(),
            role: message.role,
            content: message.content,
            data: message.data,
            createdAt: message.createdAt instanceof Date? message.createdAt.toISOString(): message.createdAt,
            toolInvocations: message.toolInvocations?.map((toolInvocation) => ({ ...toolInvocation })),
        })
    )] satisfies Conversation["messages"];
}

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
    conversationHistory?: Message[]
    initialUserMessage?: string
    initialToolName?: string
    initialConversationId?: string
}

export function ChatProvider({
    children,
    conversationHistory,
    initialUserMessage,
    initialToolName,
    initialConversationId,
}: ChatProviderProps) {
    const { state, insertConversation } = useGlobalContext() as GlobalState;
    const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
    const [article, setArticle] = useState<StockNews|null>(null);
    const [shouldSyncConversation, setShouldSyncConverastion] = useState<boolean>(false);
    const { messages, input, isLoading, error, setInput, append } = useChat({
        api: '/api/ai/chat',
        initialMessages: conversationHistory,
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {
            userId: state.id,
            userName: state.name,
            accountType: state.accountType,
            conversationId: conversationId,
        },
        onResponse(response) {
            // if a new conversation is started,
            // the conversation id and name are returned in response headers
            const _conversationId = response.headers.get("X-Conversation-Id");
            const _conversationName = response.headers.get("X-Conversation-Name");
            if (_conversationId) {
                insertConversation({
                    id: _conversationId,
                    name: _conversationName ?? "New conversation",
                    updatedAt: new Date(),
                });
                // update path without triggering refresh
                window.history.pushState(null, '', `chat/c/${_conversationId}`);
                setConversationId(_conversationId);
            }
        },
        onFinish(message) {
            if (state.accountType !== "GUEST") {
                setShouldSyncConverastion(message.role === "assistant" && message.content.length > 0);
            }
        }
    });

    useEffect(() => {
        // trigger chat submission if initial user message exists
        if (initialUserMessage && !isLoading) {
            onSubmit(initialUserMessage, initialToolName);
        }
    }, [initialUserMessage]);

    const syncConversation = useCallback(
        async () => {
            try {
                // if this is the first message in the conversation, conversationId will be undefined
                const _id = conversationId ?? extractConversationIdFromPathname(location.pathname);
                if (!_id) throw new Error();

                await updateConversationAction(_id, { messages: getJSONCompatibleMessages(messages) });
            } catch (e) {
                console.error("Couldn't update conversation", e);
            }
        },
        [conversationId, messages]
    );

    useEffect(() => {
        if (shouldSyncConversation) {
            syncConversation();
            setShouldSyncConverastion(false);
        }
    }, [shouldSyncConversation]);

    const onSubmit = useCallback(
        async (content: string, toolName?: string) => {
            if (isLoading || content.length < 1) return;
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
        [isLoading, article, setInput, setArticle, append]
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