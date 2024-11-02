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

import { getConversationAction, appendMessagesAction } from "@/actions/crud/conversation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { StockNews } from "@/types/data";

export type ChatState = {
    input: string
    article: StockNews
    messages: Message[]
    isLoading: boolean
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
    initialMessage?: string
}

export function ChatProvider({
  children,
  initialMessage,
}: ChatProviderProps) {
    const { state, insertConversationAndUpdateState } = useGlobalContext() as GlobalState;
    const [conversationId, setConversationId] = useState<string|undefined>(undefined); // id of conversation in db
    const [chatId, setChatId] = useState<number>(0); // id of conversation in chat state, used for getting resetting chat
    const [initialMessages, setInitialMessages] = useState<Message[]>(
        initialMessage? [{ id: generateId(), role: "assistant", content: initialMessage }]: []
    );
    const [article, setArticle] = useState<StockNews|null>(null);
    // messages to be saved to db
    const [messageQueue, setMessageQueue] = useState<Message[]>(
        initialMessage? [{ id: generateId(), role: "assistant", content: initialMessage }]: []
    );
    const { messages, input, isLoading, error, setInput, append } = useChat({
        id: chatId.toString(),
        initialMessages,
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {
            userId: state?.id,
            accountType: state?.accountType,
            conversationId,
        },
        onFinish(message) {
            setMessageQueue((curr) => [...curr, message]);
        }
    });

    const onNewChat = useCallback(
        () => {
            setChatId((curr) => curr + 1);
            setConversationId(undefined);
            setInitialMessages([]);
            setMessageQueue([]);
            setInput('');
            setArticle(null);
        },
        [setChatId, setConversationId, setInitialMessages, setMessageQueue, setInput, setArticle]
    );

    const onSelectConversation = useCallback(
        async (newConversationId: string) => {
            const res = await getConversationAction(newConversationId);
            console.log(res);
            if (res) {
                setChatId((curr) => curr + 1);
                // @ts-ignore
                setInitialMessages(res.messages || []);
                setConversationId(newConversationId);
            }
            // reset input and article
            setInput('');
            setArticle(null);
            setMessageQueue([]);
        },
        [setChatId, setConversationId, setInitialMessages, setMessageQueue, setInput, setArticle]
    );

    const saveConversation = useCallback(
        async (newMessages: Message[]) => {
            if (!conversationId) {
                // create new conversation record
                const lastUserMessage = newMessages.filter((message) => message.role === "user")?.[0].content;
                const _conversationId = await insertConversationAndUpdateState({
                    name: lastUserMessage?.slice(0, 20) || "New conversation",
                    // @ts-ignore
                    messages: [...newMessages]
                });
                setConversationId(_conversationId);
                console.log("inserted conversation");
            } else {
                // @ts-ignore
                await appendMessagesAction(conversationId, newMessages);
                console.log("updated conversation");
            }
        },
        [conversationId, insertConversationAndUpdateState]
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
            setMessageQueue((curr) => [...curr, message]);
            append(message, { body: { toolName, article } });
            setArticle(null);
            setInput('');
        },
        [isLoading, article, setInput, setArticle, setMessageQueue, append]
    );

    useEffect(() => {
        // sync conversation with db once assistant message is received
        if (messageQueue.length > 1 && messageQueue[messageQueue.length - 1].role === "assistant") {
            // @ts-ignore
            saveConversation(messageQueue);
            setMessageQueue([]);
        }
    }, [messageQueue, saveConversation, setMessageQueue]);

    return (
        <ChatContext.Provider
            value={{
                input,
                article,
                messages,
                isLoading,
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