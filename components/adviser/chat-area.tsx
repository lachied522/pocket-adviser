"use client";
import { useState, useEffect } from "react";

import { type Message } from '@ai-sdk/react';

import { motion, AnimatePresence } from "framer-motion";

import { ArrowBigUp, ChevronDown, RefreshCcw, SquarePen, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import GetAdviceDialog from "./get-advice-dialog";

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
            {message.content && (
            <Card className="max-w-[75%]">
                <CardContent
                    className={cn("font-medium px-3 py-2", message.role === "user" && "bg-neutral-50 border-none")}
                >
                    {message.content}
                </CardContent>
            </Card>
            )}
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

export default function ChatArea() {
    const [messages, setMessages] = useState<Omit<Message, 'id'>[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(true);

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

    const onAdviceCallback = ({ action, amount }: { amount: number, action: 'deposit'|'withdraw'|'review' }) => {
        const content = action === 'review'? 'Can you review my portfolio?': `I would like to ${action} ${amount}. Can you provide some recommendations?`;
        setInput(content);
        onSubmit(content);
    }

    const onReset = () => {
        setInput('');
        setMessages([]);
    }

    return (
        <div>
            <div className="w-full flex flex-row justify-between">
                <H3 className=''>My Adviser</H3>
                
                <div className='flex flex-row items-center gap-3.5'>
                    <GetAdviceDialog
                        onSubmit={onAdviceCallback}
                    >
                        <Button
                            variant='ghost'
                            className='h-10 w-10 p-0'
                        >
                            <TrendingUp size={24} />
                        </Button>
                    </GetAdviceDialog>

                    <Button
                        variant='ghost'
                        onClick={onReset}
                        className='h-10 w-10 p-0'
                    >
                        <SquarePen size={24} />
                    </Button>
                </div>
            </div>

            <div className="max-w-[960px] flex flex-col gap-3 mx-auto">
                <AnimatePresence>
                    <motion.div
                        key='adviser'
                        initial={{ opacity: 0, height: 0, y: -800 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -800 }}
                        transition={{
                            ease: "easeOut",
                            duration: 0.32,
                        }}
                    >
                        {isOpen && (
                        <ScrollArea className="h-[360px]">
                            <div className=" flex flex-col justify-end gap-3 px-2 py-3">
                                {messages.map((message, index) => (
                                <ChatMessage key={`message-${index}`} message={message} />
                                ))}
                                {isLoading && messages.at(-1)?.role === 'user' && (
                                <LoadingMessage />
                                )}
                            </div>
                        </ScrollArea>
                        )}
                    </motion.div>
                </AnimatePresence>

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

                <div className="flex flex-row border border-neutral-100 rounded-lg">
                    <Input
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onSubmit(input) }}
                        placeholder='Ask me something!'
                        className='h-12 w-full border-0 bg-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0'
                    />

                    <Button
                        onClick={() => onSubmit(input)}
                        className="h-12 w-12 bg-neutral-100 p-0 group rounded-l-none"
                    >
                        <ArrowBigUp size={27} className={'text-black group-hover:text-white'} />
                    </Button>
                </div>
            </div>
        </div>
    )
}