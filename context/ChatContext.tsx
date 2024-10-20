"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { useActions, useUIState, readStreamableValue, StreamableValue } from 'ai/rsc';
import { generateId } from 'ai';

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { ClientMessage } from "@/actions/ai/chat";
import type { StockNews } from "@/types/data";

export type ChatState = {
    input: string
    article: StockNews
    conversation: ClientMessage[]
    isLoading: boolean
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
    const [conversation, setConversation] = useUIState();
    const { greetUser, continueConversation, clearConversation } = useActions();
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [article, setArticle] = useState<StockNews|null>(null);
    const [saidHello, setSaidHello] = useState<boolean>(false);

    const appendMessage = useCallback(
        (message : ClientMessage) => {
            setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                message,
            ]);
        },
        [setConversation]
    );

    const sendMessage = useCallback(
        async ({
            input,
            tool,
        } : {
            input: string,
            tool?: string,
        }) => {
            setIsLoading(true);
            // add user message to conversation
            appendMessage({ id: generateId(), role: 'user', display: input, article });

            const { response, loading } = await continueConversation({
                user: state,
                toolName: tool,
                input,
                article,
            }) as {
                response: ClientMessage,
                loading?: StreamableValue<{ loading: boolean }>
            };

            // append response to conversation
            appendMessage(response);

            if (loading) {
                // update loading state
                // see https://sdk.vercel.ai/docs/ai-sdk-rsc/loading-state
                for await (const loadingDelta of readStreamableValue(loading)) {
                    if (loadingDelta) setIsLoading(loadingDelta.loading);
                }
            }

            setIsLoading(false);
        },
        [state, continueConversation, article]
    );

    useEffect(() => {
        // ask AI to introduce itself on first load
        if (!(saidHello || conversation.length > 0)) {
            sayHello();
        }

        async function sayHello() {
            setSaidHello(true); // prevent effect from running more than once
            setIsLoading(true);
            const response = await greetUser({ user: state });
            // append response to conversation
            appendMessage(response);
            // append sample prompts
            setIsLoading(false);
        };
    }, []);

    const onSubmit = useCallback(
        async (input: string, tool?: string) => {
            if (isLoading) return;
            // clear input
            setInput('');
            // clear article
            setArticle(null);
            // send message
            await sendMessage({ input, tool });
        },
        [isLoading, setInput, setArticle, sendMessage]
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