"use client";
import { useCallback, useState } from "react";

import { ArrowBigUp, OctagonAlert, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { useScrollAnchor } from "@/hooks/useScrollAnchor";
// import { useMessageThrottle } from "@/hooks/useMessageThrottle";

import { type ChatState, useChatContext } from "@/context/ChatContext";

import SamplePrompts from "./sample-prompts";
import { ChatMessage } from "./messages";

import type { StockNews } from "@/types/data";
import type { Message } from "ai";

export default function ChatArea() {
    const { input, article, messages, isLoading, isLoadingInitialMessages, error, setInput, setArticle, onSubmit } = useChatContext() as ChatState;
    const { scrollAreaRef, anchorRef, setShouldAutoScroll } = useScrollAnchor();
    // const throttledMessages = useMessageThrottle(messages, 200);
    const [isDragging, setIsDragging] = useState<boolean>(false); // true when user is dragging an article

    const onDrop = useCallback(
        (e: React.DragEvent<HTMLInputElement>) => {
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
        <div className='flex-1 w-full max-w-6xl flex flex-col pb-6 px-3 md:px-6 mx-auto overflow-hidden'>
            <div
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(e) => {
                    e.preventDefault(); // enable dropping
                    setIsDragging(true);
                }}
                onDrop={onDrop}
                className={cn('flex-1 overflow-hidden', isDragging && 'border-zinc-200')}
            >
                <ScrollArea ref={scrollAreaRef} className='max-h-full h-full scroll-smooth'>
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

                        {isLoadingInitialMessages && (
                        <div className='h-48 w-full max-w-[900px] flex pt-7'>
                            <Skeleton className='flex-1 bg-zinc-100 rounded-xl' />
                        </div>
                        )}

                        {!isLoadingInitialMessages && !error && messages.length === 1 && messages[0].role === 'assistant' && (
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
                </ScrollArea>
            </div>

            <div className='w-full flex flex-col justify-center gap-3 pt-3'>
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
                            className='h-full w-full text-base font-medium bg-zinc-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
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