"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

import { ArrowBigUp, SquarePen, Stethoscope, TrendingUp, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";
import NewsCarousel from "./news-carousel";
import NewsArticle from "./news-article";

import type { ClientMessage } from "@/actions/ai/chat";
import type { StockNews } from "@/types/api";
import SamplePrompts from "./sample-prompts";

const UserMessage = ({ children }: { children: React.ReactNode }) => {
    return (
        <Card>
            <CardContent className="font-medium px-3 py-2 bg-neutral-50 border-none">
                {children}
            </CardContent>
        </Card>
    )
}

const initialMessage = {
    id: generateId(),
    role: "assistant" as const,
    display: (
        <Card>
            <CardContent className="font-medium px-3 py-2 whitespace-pre-wrap">
                Hey! How's it going?
            </CardContent>
        </Card>
    )
} satisfies ClientMessage;

export default function ChatArea() {
    const { state } = useGlobalContext() as GlobalState;
    const [conversation, setConversation] = useUIState();
    const { continueConversation, clearConversation } = useActions();
    const [input, setInput] = useState<string>('');
    const [article, setArticle] = useState<StockNews|null>(null);

    useEffect(() => {
        setConversation([initialMessage]);
    }, []);

    const onSubmit = async (content: string) => {
        if (content.length === 0) return;
        // clear input
        setInput('');
        setArticle(null);

        if (article) {
            // append article to conversation
            setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                {
                    id: generateId(),
                    role: 'user',
                    display: <NewsArticle article={article} />
                },
            ]);
        }
        
        setConversation((currentConversation: ClientMessage[]) => [
          ...currentConversation,
          { id: generateId(), role: 'user', display: content },
        ]);

        const message = await continueConversation({
            userId: state?.id,
            input: content,
            article
        });

        setConversation((currentConversation: ClientMessage[]) => [
          ...currentConversation,
          message,
        ]);
    }

    const onAdviceCallback = ({ action, amount }: { action: 'deposit'|'withdrawal',  amount: number }) => {
        const content = `I would like to ${action} ${formatDollar(amount)}. Can you provide some recommendations?`;
        onSubmit(content);
    }

    const onReviewCallback = () => {
        const content = "Can you provide some recommendations for my portfolio?";
        onSubmit(content);
    }

    const onReset = async () => {
        await clearConversation();
        setInput('');
        setArticle(null);
        setConversation([]);
    }

    const onArticleDrop = (e: React.DragEvent<HTMLInputElement>) => {
        e.preventDefault();
        const articleData = e.dataTransfer.getData("text");
        const article = JSON.parse(articleData) as StockNews;
        setArticle(article);
        setInput("Can you tell me about this article?");
    }

    return (
        <div className='grid grid-cols-1 xl:grid-cols-[240px_1fr_240px] gap-6 xl:gap-3.5'>
            <div className='flex flex-col md:flex-row xl:flex-col items-start md:items-center xl:items-start justify-between xl:justify-start gap-3 order-first'>
                <H3 className=''>My Adviser</H3>

                <div className='flex flex-wrap lg:flex-row xl:flex-col items-center xl:items-start gap-3.5'>
                    <span className='w-full sm:w-auto text-sm font-medium text-slate-600'>Quick actions</span>
                    <Button
                        variant='ghost'
                        onClick={onReset}
                        className='h-[42px] xl:w-[180px] flex font-medium justify-start gap-1 py-3'
                    >
                        <span className='text-lg mr-2'>🌱</span>
                        New chat
                    </Button>

                    <CheckupDialog onSubmit={onReviewCallback}>
                        <Button
                            variant='ghost'
                            className='h-[42px] xl:w-[180px] flex font-medium justify-start gap-1 py-3'
                        >
                            <span className='text-lg mr-2'>🩺</span>
                            Checkup
                        </Button>
                    </CheckupDialog>

                    <GetAdviceDialog onSubmit={onAdviceCallback}>
                        <Button
                            variant='ghost'
                            className='h-[42px] xl:w-[180px] flex font-medium justify-start gap-1 py-3'
                        >
                            <span className='text-lg mr-2'>📈</span>
                            Advice
                        </Button>
                    </GetAdviceDialog>
                </div>

                <div className='hidden lg:block xl:hidden w-[100px]' />
            </div>

            <div onDrop={onArticleDrop} className='md:px-6 xl:px-3 order-last xl:order-2'>
                <div className="max-w-[960px] flex flex-col gap-3 mx-auto shadow-inner shadow-slate-50 rounded-lg">
                    <ScrollArea>
                        <div className="h-[600px] 2xl:h-[720px] flex flex-col justify-start gap-3 px-3 py-3">
                            {conversation.map((message: ClientMessage) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex flex-row',
                                    message.role === 'user' && 'justify-end'
                                )}
                            >
                                <div className=''>
                                    <div className='text-sm font-medium text-slate-600'>
                                        {message.role === "assistant"? "Pocket Adviser": "Me"}
                                    </div>
                                    {message.role === "assistant"? (
                                    <>{message.display}</>
                                    ) : (
                                    <UserMessage>
                                        {message.display}
                                    </UserMessage>
                                    )}
                                </div>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>

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
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') onSubmit(input) }}
                            placeholder='Ask me something!'
                            className='h-full w-full text-base font-medium bg-slate-100 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />

                        <Button
                            onClick={() => onSubmit(input)}
                            className="h-full aspect-square bg-neutral-100 p-0 group rounded-none"
                        >
                            <ArrowBigUp size={27} className={'text-black transition-colors duration-200 group-hover:text-white'} />
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className='xl:order-last'>
                <NewsCarousel />
            </div>
        </div>

    )
}