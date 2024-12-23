"use client";
import { useCallback, useState } from "react";

import { ArrowBigUp, OctagonAlert, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { useScrollAnchor } from "@/hooks/useScrollAnchor";

import { type ChatState, useChatContext } from "../context";

import SamplePrompts from "./sample-prompts";
import { ChatMessage } from "./messages";

import type { StockNews } from "@/utils/financial_modelling_prep/types";
import type { Message } from "ai";

export default function ChatArea() {
    const { input, article, messages, isLoading, error, setInput, setArticle, onSubmit } = useChatContext() as ChatState;
    const { scrollAreaRef, anchorRef, setShouldAutoScroll } = useScrollAnchor();
    const [isDragging, setIsDragging] = useState<boolean>(false); // true when user is dragging an article

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer.getData("text"));
                if ('article' in data) {
                    const article = data.article as StockNews;
                    setArticle(article);
                }
                if ('input' in data) {
                    setInput(data.input);
                }
                
                setIsDragging(false);
            } catch (e) {
                // pass
            }
        }, [setArticle, setInput, setIsDragging]
    );

    return (
        <div className='flex-1 flex flex-col overflow-hidden'>
            <div ref={scrollAreaRef} className='flex-1 overflow-y-auto scroll-smooth'>
                <div className='max-w-7xl flex mx-auto overflow-hidden'>
                    <div
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDragOver={(e) => {
                            e.preventDefault(); // enable dropping
                            setIsDragging(true);
                        }}
                        onDrop={onDrop}
                        className={cn('flex-1 overflow-hidden', isDragging && 'shadow-inner')}
                    >
                        <div className='flex flex-col justify-start gap-3 px-3 sm:px-6'>
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
            </div>

            <div className='w-full max-w-7xl flex flex-col justify-center gap-3 px-6 py-3 mx-auto'>
                <span className='text-xs text-center'>Please double-check important information and contact a financial adviser if you require advice.</span>
                
                <div className='w-full flex flex-row gap-1'>
                    <div className={cn(
                        "h-12 flex-1 flex flex-row border border-zinc-100 rounded-l-md overflow-hidden",
                        article && "h-16"
                    )}>
                        {article && (
                        <div className="h-16 w-32 relative group">
                            <img
                                src={article.image || ''}
                                alt={article.title}
                                style={{
                                    objectFit: "cover"
                                }}
                            />
                            <div
                                onClick={() => {
                                    setArticle(null);
                                    setInput("");
                                }}
                                className="hidden items-center justify-center bg-black/45 absolute inset-0 cursor-pointer group-hover:flex"
                            >
                                <X color="white" />
                            </div>
                        </div>
                        )}
                        <Input
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    setShouldAutoScroll(true);
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
                            setShouldAutoScroll(true);
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