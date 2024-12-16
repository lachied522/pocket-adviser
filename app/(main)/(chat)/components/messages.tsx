"use client";
import { useEffect, useState } from "react";

import type { Message, ToolInvocation } from "ai";

import { CheckCheck, OctagonAlert } from "lucide-react";

import { cn } from "@/components/utils";

import { PlainTextMessage } from "@/components/ai/messages";
import AdviceTabs from "@/components/advice/advice-tabs";
import SearchResults from "./search-results";
import NewsArticle from "./news-article";
import StockCard from "./stock-card";

import type { StockNews } from "@/utils/financial_modelling_prep/types";

function LoadingMessage({ msg }: { msg?: string }) {
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
        <PlainTextMessage content={(msg? msg: "Thinking") + ellipsis} role="assistant" />
    )
}

function ToolStatusMessage({ msg, isError }: { msg: string, isError: boolean }) {
    return (
        <div className='flex flex-row items-center gap-2'>
            {isError? (
            <OctagonAlert size={16} color="rgb(220 38 38)" />
            ): (
            <CheckCheck size={16} color="rgb(22 163 74)" />
            )}
            <p className='text-sm'>{msg}</p>
        </div>
    )
}

function ToolMessage({ toolInvocation }: { toolInvocation: ToolInvocation }) {
    const { toolName, args, state } = toolInvocation;
    switch (toolName) {
        case "getRecommendations": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting trade ideas" isError={true} />;
                }
                return <AdviceTabs advice={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg="Getting trade ideas" />;
            }
        }
        case "getStockInfo": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg={`Error getting info on ${args.symbol.toUpperCase()}`} isError={true} />;
                }
                return <StockCard {...toolInvocation.result} />;
            } else {
                return <LoadingMessage msg={`Getting info on ${args.symbol.toUpperCase()}`} />;
            }
        }
        case "getPortfolio": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error retrieving portfolio" isError={true} />;
                }
                return <ToolStatusMessage msg="Retrieved portfolio" isError={false} />;
            } else {
                return <LoadingMessage msg="Getting your portfolio" />;
            }
        }
        case "getProfile": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error retrieving profile" isError={true} />;
                }
                return <ToolStatusMessage msg="Retrieved profile" isError={false} />;
            } else {
                return <LoadingMessage msg="Getting your profile" />;
            }
        }
        case "getMarketNews": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting market news" isError={true} />;
                }
                return <SearchResults data={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg="Getting news articles" />;
            }
        }
        case "getStockNews": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting stock news" isError={true} />;
                }
                return <SearchResults data={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg={`Getting news on ${args.name? args.name: args.symbol.toUpperCase()}`} />;
            }
        }
        case "getAnalystResearch": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting analyst research" isError={true} />;
                }
                return <ToolStatusMessage msg="Retrieved analyst research" isError={false} />;
            } else {
                return <LoadingMessage msg={`Getting research on ${args.name? args.name: args.symbol.toUpperCase()}`} />;
            }
        }
        case "searchWeb": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error searching web" isError={true} />;
                }
                return <SearchResults data={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg="Searching web" />;
            }
        }
        case "readUrl": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error reading article" isError={true} />;
                }
                return <ToolStatusMessage msg="Read article" isError={false} />;
            } else {
                return <LoadingMessage msg="Reading article"/>;
            }
        }
    }
}

export function ChatMessage({
    role,
    content,
    toolInvocations,
    data,
}: Omit<Message, 'id'>) {
    // @ts-ignore
    const article = (data && 'article' in data)? data.article as StockNews: null;
    return (
        <div
            className={cn(
                'w-full flex flex-col items-start gap-2',
                role === "user" && 'items-end'
            )}
        >
            <div className='text-sm font-medium text-zinc-400'>
                {role === "assistant"? "Pocket Adviser": "Me"}
            </div>

            {article && (
            <NewsArticle article={article} />
            )}

            {toolInvocations?.map((toolInvocation: ToolInvocation) => (
            <ToolMessage
                key={toolInvocation.toolCallId}
                toolInvocation={toolInvocation}
            />
            ))}

            {content && content.length > 0 && (
            <PlainTextMessage content={content} role={role as "user"|"assistant"} />
            )}
        </div>
    )
}