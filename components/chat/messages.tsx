"use client";
import { useEffect, useState } from "react";
import Markdown from 'react-markdown'

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

import StockCard from "../stocks/stock-card";
import StockAdvice from "./stock-advice";
import RecommendationsTable from "./recommendations-table";
import SearchResults from "./search-results";
import NewsArticle from "./news-article";

import type { Message, ToolInvocation } from "ai";
import type { StockNews } from "@/types/data";
import { CheckCheck, OctagonAlert } from "lucide-react";

/** formatting functions for markdown */
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

/** end formatting functions */

function TextMessage({
    content,
    role = "assistant"
}: {
    content: string,
    role?: "user"|"assistant"
}) {
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
        <TextMessage content={(msg? msg: "Thinking") + ellipsis} role="assistant" />
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

export function ToolInvocation({ toolInvocation }: { toolInvocation: ToolInvocation}) {
    const { toolName, toolCallId, args, state } = toolInvocation;
    switch (toolName) {
        case "getRecommendations": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting trade ideas" isError={true} />;
                }

                return <RecommendationsTable data={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg="Getting trade ideas" />;
            }
        }
        case "shouldBuyOrSellStock": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return <ToolStatusMessage msg="Error getting trade ideas" isError={true} />;
                }
                
                return <StockAdvice data={toolInvocation.result} />;
            } else {
                return (
                    <LoadingMessage msg={`Getting info on`}/>
                )
            }
        }
        case "getStockInfo": {
            if (state === 'result') {
                return <StockCard stockData={toolInvocation.result} />;
            } else {
                return <LoadingMessage msg={`Getting info on ${args.symbol.toUpperCase()}`} />;
            }
        }
        case "getPortfolio": {
            if (state === 'result') {
                return <ToolStatusMessage msg="Retrieved portfolio" isError={!!!toolInvocation.result} />;
            } else {
                return <LoadingMessage msg="Getting your portfolio" />;
            }
        }
        case "getStockNews": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return (
                        <ToolStatusMessage msg="Error getting stock news" isError={true} />
                    )
                }
                return (
                    <SearchResults data={toolInvocation.result} />
                )
            } else {
                return (
                    <LoadingMessage msg={`Getting news on ${toolInvocation.args.name? toolInvocation.args.name: toolInvocation.args.symbol.toUpperCase()}`} />
                )
            }
        }
        case "getMarketNews": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return (
                        <ToolStatusMessage msg="Error getting market news" isError={true} />
                    )
                }
                return (
                    <SearchResults data={toolInvocation.result} />
                )
            } else {
                return (
                    <LoadingMessage msg="Getting news articles" />
                )
            }
        }
        case "searchWeb": {
            if (state === 'result') {
                if (!toolInvocation.result) {
                    return (
                        <ToolStatusMessage msg="Error searching web" isError={true} />
                    )
                }
                return (
                    <SearchResults data={toolInvocation.result} />
                )
            } else {
                return (
                    <LoadingMessage msg="Searching web" />
                )
            }
        }
        case "readUrl": {
            if (state === 'result') {
                return (
                    <ToolStatusMessage msg="Read article" isError={!!!toolInvocation.result} />
                )
            } else {
                return (
                    <LoadingMessage
                        key={`loading-message-${toolCallId}`}
                        msg="Reading url"
                    />
                )
            }
        }
    }
}

export function ChatMessage({
    id,
    role,
    content,
    toolInvocations,
    data,
}: Message) {
    // @ts-ignore
    const article = (data && 'article' in data)? data.article as StockNews: null;
    return (
        <div
            className={cn(
                'w-full flex flex-col items-start lg:pr-24 gap-2',
                role === "user" && 'items-end lg:pr-0 lg:pl-24'
            )}
        >
            <div className='text-sm font-medium text-slate-600'>
                {role === "assistant"? "Pocket Adviser": "Me"}
            </div>

            {article && (
            <NewsArticle article={article} />
            )}

            {content.length > 0? (
            <TextMessage content={content} role={role as "user"|"assistant"} />
            ) : (
            <>
                {toolInvocations?.map((toolInvocation: ToolInvocation) => (
                    <ToolInvocation
                        key={toolInvocation.toolCallId}
                        toolInvocation={toolInvocation}
                    />
                ))}
            </>
            )}
        </div>
    )
}