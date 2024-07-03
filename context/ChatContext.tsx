"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { ClientMessage } from "@/actions/ai/chat";
import type { StockNews } from "@/types/api";

export type AdviserState = {
    input: string
    article: StockNews
    conversation: ClientMessage[]
    isLoading: boolean
    setInput: React.Dispatch<React.SetStateAction<string>>
    setArticle: React.Dispatch<React.SetStateAction<StockNews|null>>
    onSubmit: (content: string) => void
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
    const [conversation, setConversation] = useUIState();
    const { continueConversation, clearConversation } = useActions();
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [article, setArticle] = useState<StockNews|null>(null);
    const [saidHello, setSaidHello] = useState<boolean>(false);
    const cooldownRef = useRef<ReturnType<typeof setTimeout>|null>(null);

    const sendMessage = useCallback(
        async ({
            content,
            addUserMessage = true,
            addAssistantMessage = true,
        } : {
            content: string,
            addUserMessage?: boolean,
            addAssistantMessage?: boolean,
        }) => {
            if (addUserMessage) {
                // add user message to conversation
                setConversation((currentConversation: ClientMessage[]) => [
                    ...currentConversation,
                    { id: generateId(), role: 'user', display: content, article },
                ]);
            }

            const response = await continueConversation({
                user: state,
                input: content,
                article,
            });

            if (addAssistantMessage) {
                setConversation((currentConversation: ClientMessage[]) => [
                    ...currentConversation,
                    response,
                ]);
            }

            return response;
        },
        [state, continueConversation, article]
    );

    useEffect(() => {
        // ask AI to introduce itself on first load
        if (!saidHello && process.env.ENVIRONMENT !== "development") {
            sayHello();
        }

        async function sayHello() {
            setSaidHello(true); // prevent effect from running more than once
            const content = `Hello!${state? ' My name is ' + state.name: ''} Breifly introduce yourself and tell me what you can do. Include a sentence about the current stock market.`;
            await sendMessage({
                content,
                addUserMessage: false,
            });
        };
    }, []);

    useEffect(() => {
        // TO DO: find a better way to handle loading state
        // whenever an update in conversation is detected, setIsLoading with a 3s cooldown
        if (conversation.length > 0) {
            setIsLoading(true);
            // Clear existing timeout to ensure there's only one
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
            // add new cooldown
            cooldownRef.current = setTimeout(() => {
                setIsLoading(false);
                cooldownRef.current = null; // Clear the ref when done
            }, 10000);
        }

        return () => {
            if (cooldownRef.current) {
                clearTimeout(cooldownRef.current);
            }
        };
    }, [conversation, setIsLoading]);

    const onSubmit = useCallback(
        async (content: string) => {
            // clear input
            setInput('');
            // clear article
            setArticle(null);
            // send message
            await sendMessage({ content });
        },
        [setInput, setArticle, sendMessage]
    );

    const onReset = useCallback(
        async () => {
            await clearConversation();
            setInput('');
            setArticle(null);
            setConversation([]);
        },
        [clearConversation, setInput, setArticle, setConversation]
    );

    return (
        <ChatContext.Provider
            value={{
                input,
                article,
                conversation,
                isLoading,
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