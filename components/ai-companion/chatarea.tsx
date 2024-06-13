"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { ArrowBigUp, ChevronDown, RefreshCcw, SquarePen, TrendingUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography";
import { cn } from "@/components/utils";

import GetAdviceDialog from "./get-advice-dialog";

import type { Message } from "@/types/ai";

const SAMPLE_PROMPTS = [
    "Should I buy shares in BHP?",
    "Should I invest more in ETFs?",
    "Why is the market up/down today?",
    "What does 'EPS' mean?"
]

async function* readStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();

    try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const text = decoder.decode(value);
          yield text;
        }
    } catch (error) {
        console.error('Error reading stream:', error);
    }
};

export default function ChatArea() {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);

    const onReset = () => {
        // reset chat area
        setMessages([]);
        setInput('');
    }

    const onSubmitMessage = async (content: string) => {
        if (content.length === 0) return;

        try {
            // add message to messages array
            const message: Message = {
                role: 'user',
                content: content,
            }
            const _messages = [...messages, message];
            setMessages(_messages);
            // reset input
            setInput('');
            // 
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ messages: _messages }),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!(response.ok && response.body)) {
                return;
            }

            const reader = response.body.getReader();
            let finishedMessage: Message = {
                content: "",
                role: "assistant"
            };

            for await (const text of readStream(reader)) {
                // check for errors matching !error:ErrorName
                const error = text.match(/^!error:(\w+)$/);
                if (error) {
                    console.error(error[1]);
                    break;
                }

                console.log(text);

                finishedMessage.content += text;
                setMessages([
                    ..._messages,
                    finishedMessage
                ]);
            }
        } catch (e) {

        }
    }

    const onAdviceCallback = ({ action, amount }: { amount: number, action: 'deposit'|'withdraw'|'review' }) => {
        const content = action === 'review'? 'Can you review my portfolio?': `I would like to ${action} ${amount}. Can you provide some recommendations?`;
        setInput(content);
        onSubmitMessage(content);
    }

    return (
        <div>
            <div className="w-full flex flex-row justify-between">
                <div className='flex flex-row items-center gap-3.5'>
                    <Button
                        variant='secondary'
                        // disabled
                        onClick={() => setIsOpen(!isOpen)}
                        className='h-8 w-8 p-0'
                    >
                        <ChevronDown size={16} className={cn('transition-transform duration-300', isOpen && '-rotate-180')} />
                    </Button>

                    <H3 className=''>My Adviser</H3>
                </div>

                {isOpen && (
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
                )}
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
                                <div
                                    key={`message-${index}`}
                                    className={cn(
                                        'flex flex-row',
                                        message.role === 'user' && 'justify-end'
                                    )}
                                >
                                    <Card className="max-w-[75%]">
                                        <CardContent
                                            className={cn("font-medium px-3 py-2", message.role === "user" && "bg-neutral-50 border-none")}
                                        >
                                            {message.content}
                                        </CardContent>
                                    </Card>
                                </div>
                                ))}
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
                    >
                        {prompt}
                    </Button>
                    ))}
                </div>
                
                <div className="flex flex-row border border-neutral-100 rounded-lg">
                    <Input
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onSubmitMessage(input) }}
                        placeholder='Ask me something!'
                        className='h-12 w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                    />

                    <Button
                        onClick={() => onSubmitMessage(input)}
                        className="h-12 w-12 bg-neutral-100 p-0 group rounded-l-none"
                    >
                        <ArrowBigUp size={27} className={'text-black group-hover:text-white'} />
                    </Button>
                </div>
            </div>
        </div>
    )
}