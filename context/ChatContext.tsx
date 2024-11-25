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

import { getConversationAction, updateConversationAction } from "@/actions/crud/conversation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { StockNews } from "@/types/data";
import type { Conversation } from "@prisma/client";

function convertToSafeMessages(messages: Message[]) {
    // convert to JSON-compatible array
    return [
        ...messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            data: message.data,
            createdAt: message.createdAt instanceof Date? message.createdAt.toISOString(): message.createdAt,
            toolInvocations: message.toolInvocations?.map((toolInvocation) => ({ ...toolInvocation })),
        })
    )] satisfies Conversation["messages"]
}

export type ChatState = {
    input: string
    article: StockNews
    messages: Message[]
    isLoading: boolean
    isLoadingInitialMessages: boolean
    error?: Error
    conversationId?: string
    setInput: React.Dispatch<React.SetStateAction<string>>
    setArticle: React.Dispatch<React.SetStateAction<StockNews|null>>
    onSubmit: (content: string, tool?: string) => void
    onSelectConversation: (conversationId?: string) => Promise<void>
    onNewChat: () => void
}

const ChatContext = createContext<any>(null);

export const useChatContext = () => {
  return useContext(ChatContext);
}

interface ChatProviderProps {
    children: React.ReactNode
    initialQuery?: string
}

export function ChatProvider({
    children,
    initialQuery
}: ChatProviderProps) {
    const { state, insertConversationAndUpdateState } = useGlobalContext() as GlobalState;
    const [conversationId, setConversationId] = useState<string|null>(null); // id of conversation in db
    const [chatId, setChatId] = useState<number>(0); // id of conversation in chat state, used for getting resetting chat
    const [initialMessages, setInitialMessages] = useState<Message[]>(
        initialQuery? [{ id: generateId(), role: "user", content: initialQuery }]: []
    );
    const [isLoadingInitialMessages, setIsLoadingInitialMessages] = useState<boolean>(false);
    const [article, setArticle] = useState<StockNews|null>(null);
    const { messages, input, isLoading, error, setInput, append, reload } = useChat({
        id: chatId.toString(),
        initialMessages,
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {
            userId: state.id,
            accountType: state.accountType,
            conversationId,
        },
        async onFinish(message: Message) {
            try {
                if (message.role === "assistant" && message.content.length > 0) {
                    await syncConversation(conversationId, [...messages, message]);
                }
            } catch (e) {
                console.error(e);
            }
        }
    });

    useEffect(() => {
        if (initialQuery) {
            reload();
        } else {
            setIsLoadingInitialMessages(true);
            fetchGreeting()
            .then(() => setIsLoadingInitialMessages(false));
        }

        async function fetchGreeting() {
            try {
                const { message } = await fetch('/api/chat/greet').then((res) => res.json());
                setInitialMessages([{ id: generateId(), role: "assistant", content: message }]);
            } catch (e) {
                console.error(e);
            }
        };
    }, [initialQuery]);

    const syncConversation = useCallback(
        async (id: string|null, _messages: Message[]) => {
            if (id) {
                try {
                    await updateConversationAction(
                        id,
                        { messages: convertToSafeMessages(_messages) }
                    );   
                } catch (e) {
                    // TO DO
                    console.error("Couldn't update conversation for ", id);
                }
            } else {
               // create new conversation record
               const lastUserMessage = _messages.filter((message) => message.role === "user")?.[0].content;
               const _id = await insertConversationAndUpdateState({
                   name: lastUserMessage?.slice(0, 50) || "New conversation",
                   messages: convertToSafeMessages(_messages),
               });
               setConversationId(_id);
            }
        },
        [insertConversationAndUpdateState, setConversationId]
    );

    const onNewChat = useCallback(
        () => {
            console.log("new chat");
            setInitialMessages([]);
            setChatId((curr) => curr + 1); // required to reset chat state
            setConversationId(null);
            setArticle(null);
            setInput('');
        },
        [setChatId, setConversationId, setInitialMessages, setInput, setArticle]
    );

    const onSelectConversation = useCallback(
        async (newConversationId: string) => {
            const res = await getConversationAction(newConversationId);
            if (res) {
                setChatId((curr) => curr + 1);
                setInitialMessages(res.messages as any);
                setConversationId(newConversationId);
            }
            setArticle(null);
            setInput('');
        },
        [setChatId, setConversationId, setInitialMessages, setInput, setArticle]
    );

    const onSubmit = useCallback(
        async (content: string, toolName?: string) => {
            if (isLoading) return;
            const message = {
                id: generateId(),
                role: 'user' as const,
                data: { article },
                content,
            };
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
                isLoadingInitialMessages,
                error,
                conversationId,
                setInput,
                setArticle,
                onSelectConversation,
                onNewChat,
                onSubmit,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}