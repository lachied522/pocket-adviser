"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { type Message } from '@ai-sdk/react';

import { ArrowBigUp, ChevronDown, RefreshCcw, SquarePen, Stethoscope, TrendingUp, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";
import NewsCarousel from "./news-carousel";

import type { StockNews } from "@/types/api";

async function* readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();

    try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const text = decoder.decode(value);
          console.log('text', text);
          yield text;
        }
    } catch (error) {
        console.error('Error reading stream:', error);
    }
}

const ChatMessage = ({ message }: { message: Omit<Message, 'id'> }) => {
    return (
        <div
            className={cn(
                'flex flex-row',
                message.role === 'user' && 'justify-end'
            )}
        >
            <div className="max-w-[75%]">
                <span className='text-sm font-medium text-slate-600'>
                    {message.role === "assistant"? "Pocket Adviser": "Me"}
                </span>
                {message.content && (
                <Card>
                    <CardContent
                        className={cn("font-medium px-3 py-2", message.role === "user" && "bg-neutral-50 border-none")}
                    >
                        {message.content}
                    </CardContent>
                </Card>
                )}
            </div>
        </div>
    )
}

const LoadingMessage = () => {
    // return message to display when loading
    const [text, setText] = useState<string>('. ');

    useEffect(() => {
        const c = '. ';
        const interval = setInterval(() => {
            setText((s) => {
                return s==='. . . '? '. ': s + c;
            })
        }, 350);

        return () => {
            clearInterval(interval)
        }
    }, []);

    return (
        <ChatMessage message={{ role: "assistant", content: text }} />
    )
}

const SAMPLE_PROMPTS = [
    "Should I buy shares in BHP?",
    "Should I invest more in ETFs?",
    "Why is the market up/down today?",
    "What does 'EPS' mean?"
]

const initialMessage = {
    role: "assistant" as const,
    content: "Hey! How's it going?"
}

export default function ChatArea() {
    const [messages, setMessages] = useState<Omit<Message, 'id'>[]>([initialMessage]);
    const [input, setInput] = useState<string>('');
    const [article, setArticle] = useState<StockNews|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleStream = async (_messages: typeof messages, stream: ReadableStream) => {
        const reader = stream.getReader();

        const finishedMessage = {
            role: "assistant" as const,
            content: "",
        }

        for await (const text of readStream(reader)) {
            if (text.startsWith('!error')) {
                // TO DO
                break;
            }

            if (text.startsWith('!finish')) {
                break;
            }

            finishedMessage.content += text;
            setMessages([
                ..._messages,
                finishedMessage
            ]);
        }
    }

    const onSubmit = async (content: string) => {
        if (content.length === 0) return;

        try {
            setIsLoading(true);
            // add message to messages array
            const message = {
                role: 'user' as const,
                content: content,
            }
            const _messages = [...messages, message];
            setMessages(_messages);
            // reset input
            setInput('');
            //
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages: _messages,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!(response.ok && response.body)) {
                // TO DO
                return;
            }

            handleStream(_messages, response.body)
            .then(() => setIsLoading(false));
        } catch (e) {

        }
    }

    const onAdviceCallback = ({ action, amount }: { action: 'deposit'|'withdraw'|'review',  amount: number }) => {
        const content = action === 'review'? 'Can you review my portfolio?': `I would like to ${action} ${amount}. Can you provide some recommendations?`;
        setInput(content);
        onSubmit(content);
    }

    const onReset = () => {
        setInput('');
        setMessages([]);
    }

    const onArticleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        const articleData = e.dataTransfer.getData("text");
        const article = JSON.parse(articleData) as StockNews;
        setArticle(article);
        setInput("Can you tell me about this article?");
    }

    return (
        <div className='grid grid-cols-[240px_1fr_240px] gap-3.5'>
            <div>
                <H3 className='mb-3'>My Adviser</H3>

                <div className='flex flex-col items-start gap-3.5'>
                    <span className='text-sm font-medium text-slate-600'>Quick actions</span>
                    <Button
                        variant='ghost'
                        onClick={onReset}
                        className='h-[42px] w-[180px] grid grid-cols-[32px_1fr] text-left gap-1 py-3'
                    >
                        <SquarePen size={22} />
                        New chat
                    </Button>

                    <CheckupDialog onSubmit={() => onAdviceCallback({ action: 'review', amount: 0 })}>
                        <Button
                            variant='ghost'
                            className='h-[42px] w-[180px] grid grid-cols-[32px_1fr] text-left gap-1 py-3'
                        >
                            <Stethoscope size={22} />

                            Checkup
                        </Button>
                    </CheckupDialog>

                    <GetAdviceDialog onSubmit={onAdviceCallback}>
                        <Button
                            variant='ghost'
                            className='h-[42px] w-[180px] grid grid-cols-[32px_1fr] text-left gap-1 py-3'
                        >
                            <TrendingUp size={22} />
                            Get advice
                        </Button>
                    </GetAdviceDialog>
                </div>
            </div>

            <div onDrop={onArticleDrop}>
                <div className="max-w-[960px] flex flex-col gap-3 mx-auto">
                    <ScrollArea className="h-[600px]">
                        <div className=" flex flex-col justify-end gap-3 px-2 py-3">
                            {messages.map((message, index) => (
                            <ChatMessage key={`message-${index}`} message={message} />
                            ))}
                            {isLoading && messages.at(-1)?.role === 'user' && (
                            <LoadingMessage />
                            )}
                        </div>
                    </ScrollArea>

                    <div className="w-full flex flex-wrap justify-start gap-2">
                        {SAMPLE_PROMPTS.map((prompt, index) => (
                        <Button
                            key={`sample-prompt-${index}`}
                            variant='secondary'
                            onClick={() => setInput(prompt)}
                            className='bg-sky-700 hover:bg-sky-700 text-white'
                        >
                            {prompt}
                        </Button>
                        ))}
                    </div>

                    <div className={cn(
                        "h-12 flex flex-row border border-neutral-100 rounded-lg overflow-hidden",
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
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onSubmit(input) }}
                            placeholder='Ask me something!'
                            className='h-full w-full border-0 bg-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />

                        <Button
                            onClick={() => onSubmit(input)}
                            className="h-full aspect-square bg-neutral-100 p-0 group rounded-l-none"
                        >
                            <ArrowBigUp size={27} className={'text-black group-hover:text-white'} />
                        </Button>
                    </div>
                </div>
            </div>

            <NewsCarousel />
        </div>

    )
}