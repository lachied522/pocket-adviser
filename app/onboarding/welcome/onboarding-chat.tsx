"use client";
import { useCallback, useState } from "react";
import { useChat } from 'ai/react';
import { generateId, type Message } from 'ai';

import { ArrowBigUp, OctagonAlert, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { useScrollAnchor } from "@/hooks/useScrollAnchor";

import type { StockNews } from "@/utils/financial_modelling_prep/types";

export default function ChatArea() {
    const { messages, input, isLoading, error, setInput, append } = useChat({
        initialMessages: [],
        maxSteps: 3,
        sendExtraMessageFields: true,
        body: {},
    });

    const onSubmit = useCallback(
        async (content: string, toolName?: string) => {
            if (isLoading || content.length < 1) return;
            const message = {
                id: generateId(),
                role: "user" as const,
                content,
            }
            append(message, { body: { toolName } });
            setInput('');
        },
        [isLoading, setInput, append]
    );

    return (
        <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='flex-1 overflow-y-auto scroll-smooth'>
                <div className='max-w-6xl flex flex-col px-3 md:px-6 mx-auto overflow-hidden'>
                    <div className='flex flex-col justify-start gap-3 md:px-3 py-3'>
                        {messages.map((message: Message) => (
                        <ChatMessage
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            toolInvocations={message.toolInvocations}
                            data={message.data}
                        />
                        ))}

                        {!error && messages.length === 1 && messages[0].role === 'assistant' && (
                        <SamplePrompts />
                        )}

                        {error && (
                        <div className='flex items-center justify-center gap-2 p-6'>
                            <OctagonAlert size={16} color="rgb(220 38 38)" />
                            <p className='text-sm'>Something went wrong. Please try again later.</p>
                        </div>
                        )}

                        <div className={cn("w-full h-px hidden", isLoading && "block")} ref={anchorRef} />
                    </div>
                </div>
            </div>

            <div className='w-full max-w-6xl flex flex-col justify-center gap-3 px-2 pb-3 md:pb-6 mx-auto'>
                <span className='text-xs text-center'>Please double-check important information and contact a financial adviser if you require advice.</span>
                
                <div className='w-full flex flex-row gap-1'>
                    <div className={cn(
                        "h-12 flex-1 flex flex-row border border-zinc-100 rounded-l-md overflow-hidden",
                    )}>
                        <Input
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    onSubmit(input);
                                }
                            }}
                            placeholder='Ask me something!'
                            className='h-full w-full text-sm font-medium bg-zinc-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                    </div>

                    <Button
                        onClick={() => {
                            onSubmit(input);
                        }}
                        disabled={isLoading}
                        className="h-full aspect-square p-0"
                    >
                        <ArrowBigUp size={24} strokeWidth={2} color="white"/>
                    </Button>
                </div>
            </div>
        </div>
    )
}