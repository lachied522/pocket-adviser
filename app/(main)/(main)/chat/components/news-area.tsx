"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

import { Newspaper } from "lucide-react";

import { setCookie, getCookie } from "@/utils/cookies";

import { getNewsAction } from "@/actions/data/news";
  
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/components/utils";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import NewsArticle from "./news-article";

import type { StockNews } from "@/utils/financial_modelling_prep/types";

const MAX_PAGES = 3;
const COOKIE_NAME = "news:state";

export default function NewsArea() {
    const { partialStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<StockNews[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);

    const toggleVisible = useCallback(() => {
        setIsVisible((curr) => {
            setCookie(COOKIE_NAME, String(!curr));
            return !curr;
        });
    }, [setIsVisible]);

    useEffect(() => {
        setIsVisible(getCookie(COOKIE_NAME) === "true");
    }, []);

    useEffect(() => {
        if (isVisible) populatePage();

        async function populatePage() {
            setIsLoading(true);
            const symbols = Object.values(partialStockData).map((obj) => obj.symbol);
            const _data = await getNewsAction(symbols, page, 20);
            // update state, ensuring only unique articles are returned
            setData((curr) => {
                if (curr) {
                    const newData = [...curr];
                    for (const article of _data) {
                        if (!curr.find((obj) => obj.title === article.title)) {
                            newData.push(article);
                        }
                    }
                    return newData;
                }
                return _data;
            });
            setIsLoading(false);
        }
    }, [isVisible, page, partialStockData]);

    return (
        <div className='flex flex-col items-start gap-1 px-3 pb-1'>
            <Button
                variant='ghost'
                size='sm'
                onClick={toggleVisible}
                className={cn('', isVisible && 'bg-zinc-100')}
            >
                <Newspaper size={12} />
                <span className='text-xs'>{isVisible? "Hide": "Show"}</span>
            </Button>

            <ScrollArea className={cn('hidden w-full max-h-0 overflow-hidden transition-all duration-300 ease-in-out', isVisible && 'block max-h-none')}>
                <div className='flex flex-row items-center pb-2 gap-2'>
                    {data.map((article) => (
                    <NewsArticle
                        key={`article-${article.title}`}
                        article={article}
                        draggable
                        animateOnHover
                    />
                    ))}
                    
                    {isLoading && (
                    <>
                        {Array.from({length: 12}).map((_, index) => (
                        <div key={`news-skelton-${index}`} className='h-24 xl:h-32 w-36 xl:w-44 flex shrink-0 grow-0 p-1'>
                            <Skeleton className='flex-1 rounded-md' />
                        </div>
                        ))}
                    </>
                    )}

                    {!isLoading && data.length === 0 && (
                    <div>
                        No articles were found
                    </div>
                    )}

                    <Button
                        variant='ghost'
                        disabled={isLoading || page >= MAX_PAGES - 1}
                        onClick={() => setPage((curr) => curr + 1)}
                        className='text-sm'
                    >
                        Get more
                    </Button>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
