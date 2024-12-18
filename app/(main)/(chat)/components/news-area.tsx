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

import type { StockNews } from "@/types/data";

const MAX_PAGES = 3;
const COOKIE_NAME = "news:state";

export default function NewsArea() {
    const { state, getStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<StockNews[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(getCookie(COOKIE_NAME) === "true");
    const [page, setPage] = useState<number>(0);

    const toggleVisible = useCallback(() => {
        setIsVisible((curr) => {
            setCookie(COOKIE_NAME, String(!curr));
            return !curr;
        });
    }, [setIsVisible]);

    useEffect(() => {
        if (isVisible) populatePage();

        async function populatePage() {
            setIsLoading(true);
            const symbols = await Promise.all(
                state.holdings.map(
                    (holding) => getStockData(holding.stockId)
                    .then((stockData) => stockData.symbol)
                )
            );
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
    }, [state.holdings, isVisible, page, getStockData]);

    return (
        <div className='flex flex-col items-start gap-1 px-3 pb-1'>
            <div>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={toggleVisible}
                    className={cn('h-7 w-7', isVisible && 'bg-zinc-100')}
                >
                    <Newspaper size={20} />
                </Button>
                {/* {isVisible && data.length > 0 && (
                <div className='hidden md:block text-xs'>Tip: drag an article into the chat</div>
                )} */}
            </div>

            <ScrollArea className={cn('w-full max-h-0 overflow-hidden transition-all duration-300 ease-in-out', isVisible && 'max-h-none')}>
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
