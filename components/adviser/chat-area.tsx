"use client";
import { useState } from "react";
import Image from "next/image";

import { ArrowBigUp, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { useScrollAnchor } from "@/hooks/useScrollAnchor";

import { type ChatState, useChatContext } from "@/context/ChatContext";

import SamplePrompts from "./sample-prompts";
import NewsArticle from "./news-article";
import { ChatMessage } from "./messages";

import type { ClientMessage } from "@/actions/ai/chat";
import type { StockNews } from "@/types/data";

export default function ChatArea() {
    const { input, article, conversation, isLoading, setInput, setArticle, onSubmit } = useChatContext() as ChatState;
    const { scrollAreaRef, messagesRef, anchorRef } = useScrollAnchor();
    const [isDragging, setIsDragging] = useState<boolean>(false); // true when user is dragging an article

    const onDrop = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("text"));
        if ('article' in data) {
            const article = data.article as StockNews;
            setArticle(article);
        }
        if ('input' in data) {
            setInput(data.input);
        }
        // reset state
        setIsDragging(false);
    }

    return (
        <div className='md:px-6 xl:px-3 order-last xl:order-2'>
            <div
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(e) => {
                    e.preventDefault(); // enable dropping
                    setIsDragging(true);
                }}
                onDrop={onDrop}
                className={cn('max-w-[960px] flex flex-col gap-3 mx-auto rounded-lg border border-white shadow-inner shadow-slate-50', isDragging && 'border-slate-200')}
            >
                <ScrollArea ref={scrollAreaRef} className='h-[640px] 2xl:h-[720px]'>
                    <div ref={messagesRef} className='flex flex-col justify-start gap-3 px-3 py-3'>
                        {conversation.map((message: ClientMessage) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex flex-col items-start md:pr-24 gap-2',
                                message.role === 'user' && 'items-end md:pr-0 md:pl-24'
                            )}
                        >
                            <div className='text-sm font-medium text-slate-600'>
                                {message.role === "assistant"? "Pocket Adviser": "Me"}
                            </div>
                            {message.role === "assistant"? (
                            <>{message.display}</>
                            ) : (
                            <>
                                {message.article && <NewsArticle article={message.article} draggable={false} />}
                                <ChatMessage role="user" content={message.display} />
                            </>
                            )}
                        </div>
                        ))}
                        <div className="w-full h-px" ref={anchorRef} />
                    </div>
                </ScrollArea>

                <span className='text-xs text-center'>Please double-check important information and contact a financial adviser if you require advice.</span>

                <SamplePrompts setInput={setInput} />

                <div className={cn(
                    "h-12 xl:h-14 flex flex-row border border-neutral-100 rounded-b-lg overflow-hidden",
                    article && "h-16"
                )}>
                    {article && (
                    <div className="h-16 w-32 relative group">
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
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
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !isLoading) onSubmit(input) }}
                        placeholder='Ask me something!'
                        className='h-full w-full text-base font-medium bg-slate-100 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    <Button
                        onClick={() => onSubmit(input)}
                        disabled={isLoading}
                        className="h-full aspect-square bg-neutral-100 p-0 group rounded-none"
                    >
                        <ArrowBigUp size={27} className={'text-black transition-colors duration-200 group-hover:text-white'} />
                    </Button>
                </div>
            </div>
        </div>
    )
}