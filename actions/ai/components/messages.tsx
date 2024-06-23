"use client";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import StockCard from "./stock-card";
import RecommendationsTable from "./recommendations-table";

import type { Stock } from "@prisma/client";

export function ChatMessage({ content }: { content: string }) {
    if (content.length === 0) return null;

    return (
        <Card>
            <CardContent className="font-medium px-3 py-2 whitespace-pre-wrap">
                {content}
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

export function MessageWithRecommendations({ content, data }: { content: string, data?: any }) {
    return (
        <div className="w-full flex flex-col items-start gap-2">
            {data && <RecommendationsTable data={data} />}
            <ChatMessage content={content} />
        </div>
    )
}