"use client";
import { useEffect, useState } from "react";
import Markdown from 'react-markdown'

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

import StockCard from "../stocks/stock-card";
import StockAdvice from "./stock-advice";
import RecommendationsTable from "./recommendations-table";

import type { Stock } from "@prisma/client";

function H3(props: any) {
    return (
        <h3 className="text-xl font-semibold">
            {props.children}
        </h3>
    )
}

function OrderedList(props: any) {
    return (
        <ol className="whitespace-normal leading-loose">
            {props.children}
        </ol>
    )
}

function UnorderedList(props: any) {
    return (
        <ul className="whitespace-normal leading-loose">
            {props.children}
        </ul>
    )
}

function Link(props: any) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        className="text-sky-600 underline"
    >
        {props.children}
      </a>
    );
}

interface ChatMessageProps {
    content: any
    role?: "assistant"|"user"
}

export function ChatMessage({
    content,
    role = "assistant"
}: ChatMessageProps) {
    if (content.length === 0) return null;

    return (
        <Card>
            <CardContent className={cn(
                "max-w-[900px] font-medium px-3 py-2 text-wrap whitespace-pre-line",
                role === "user" && "bg-neutral-50 border-none"
            )}>
                <Markdown components={{ h3: H3, ol: OrderedList, ul: UnorderedList, a: Link }}>
                    {content}
                </Markdown>
            </CardContent>
        </Card>
    )
}

export function LoadingMessage({ msg }: { msg?: string }) {
    // return message to display when loading
    const [ellipsis, setEllipsis] = useState<string>('. ');

    useEffect(() => {
        const c = '. ';
        const interval = setInterval(() => {
            setEllipsis((s) => {
                return s==='. . . '? '. ': s + c;
            })
        }, 350);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <ChatMessage content={(msg? msg: "Thinking") + ellipsis} />
    )
}

export function MessageWithStockCard({ content, stockData }: { content: string, stockData?: Stock|null }) {
    return (
        <div className="flex flex-col items-start gap-2">
            {stockData && <StockCard stockData={stockData} />}
            <ChatMessage content={content} />
        </div>
    )
}

export function MessageWithStockAdvice({ content, data }: { content: string, data?: any }) {
    return (
        <div className="w-full flex flex-col items-start gap-2">
            {data && <StockAdvice data={data} />}
            <ChatMessage content={content} />
        </div>
    )
}

export function MessageWithRecommendations({ content, data }: { content: string, data?: any }) {
    return (
        <div className="w-full flex flex-col items-start gap-2">
            {data && <RecommendationsTable data={data} />}
            <ChatMessage content={content} />
        </div>
    )
}

type WebSearchResponse = {
    query: string // search query
    answer: string // generated by Tavilly AI
    results: {
        count: number
        data: {
            reference: number
            title: string
            url: string
            content: string
            score: number // closeness score?
        }[]
    }
}

export function MessageWithWebSearch({ content, res }: { content: string, res?: WebSearchResponse }) {
    return (
        <div className="w-full flex flex-col items-start gap-2">
            <ChatMessage content={content} />
            {res && (
            <div className="ml-3">
                <div>Search results for <span className='font-medium text-black'>{`"${res.query}"`}</span></div>
                {res.results.data.map((source, index) => (
                <div key={`source-${source.title}`}>
                    <span className="text-sm">{index + 1}.</span> <a href={source.url} target="_blank" className="underline text-sky-600">{source.title}</a>
                </div>
                ))}
            </div>
            )}
        </div>
    )
}