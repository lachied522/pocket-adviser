"use client";
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
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
    setArticle: React.Dispatch<React.SetStateAction<StockNews>>
    onSubmit: (content: string) => void
    onReset: () => void
}

const AdviserContext = createContext<any>(null);

export const useAdviserContext = () => {
  return useContext(AdviserContext);
}

interface AdviserProviderProps {
    children: React.ReactNode
}

export function AdviserProvider({
  children,
}: AdviserProviderProps) {
    const { state } = useGlobalContext() as GlobalState;
    const [conversation, setConversation] = useUIState();
    const { continueConversation, clearConversation } = useActions();
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [article, setArticle] = useState<StockNews|null>(null);
    const [saidHello, setSaidHello] = useState<boolean>(false);
    const cooldownRef = useRef<ReturnType<typeof setTimeout>|null>(null);

    useEffect(() => {
        // ask AI to introduce itself on first load
        if (!saidHello) sayHello();

        async function sayHello() {
            setSaidHello(true); // prevent effect from running more than once
            const message = await continueConversation({
                userId: state?.id,
                input: `Hello!${state? ' My name is ' + state.name: ''} Breifly introduce yourself and tell me what you can do. Include a sentence about the current stock market.`,
            });

            setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                message,
            ]);
        };
    }, []);

    useEffect(() => {
        // TO DO: find a better way to handle loading state
        // whenever an update in conversation is detected, setIsLoading with a 3s cooldown
        setIsLoading(true);
        // Clear existing timeout to ensure there's only one
        if (cooldownRef.current) {
            clearTimeout(cooldownRef.current);
        }
        // add new cooldown
        cooldownRef.current = setTimeout(() => {
            setIsLoading(false);
            cooldownRef.current = null; // Clear the ref when done
        }, 12000);

        return () => {
            if (cooldownRef.current) {
              clearTimeout(cooldownRef.current);
            }
        };
    }, [conversation, setIsLoading]);

    const onSubmit = async (content: string) => {
        // clear input
        setInput('');
        // add user message to conversation
        setConversation((currentConversation: ClientMessage[]) => [
            ...currentConversation,
            { id: generateId(), role: 'user', display: content },
        ]);

        const message = await continueConversation({
            userId: state?.id,
            input: content,
            article,
        });

        setConversation((currentConversation: ClientMessage[]) => [
            ...currentConversation,
            message,
        ]);
    }

    const onReset = async () => {
        await clearConversation();
        setInput('');
        setArticle(null);
        setConversation([]);
    }

  return (
    <AdviserContext.Provider
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
    </AdviserContext.Provider>
  )
}