"use client";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { getNewsAction } from "@/actions/data/news";

import NewsArticle from "./news-article";

import type { StockNews } from "@/types/data";

const MAX_PAGES = 3;

interface NewsCarouselProps {
    symbols: string[]
}

export default function NewsCarousel({ symbols }: NewsCarouselProps) {
    const [data, setData] = useState<StockNews[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    useEffect(() => {
        (async function getNews() {
            setIsLoading(true);
            const _data = await getNewsAction(symbols, page);
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
        })();
    }, [page]);

    return (
        <div className='flex flex-col items-stretch gap-2 xl:gap-3.5'>
            <div className='flex flex-row items-center xl:flex-col xl:items-start gap-x-1 gap-y-2'>
                <h4 className='text-lg font-medium text-slate-600'>News</h4>

                {data.length > 0 && <div className='text-xs text-slate-600'>Tip: drag an article into the chat</div>}
            </div>

            <ScrollArea className='xl:h-[660px]'>
                <div className='flex flex-row xl:flex-col items-center py-3 xl:px-3 xl:py-0 gap-3.5'>
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
                        {Array.from({length: 5}).map((_, index) => (
                        <Skeleton
                            key={`news-skelton-${index}`}
                            className='h-24 md:h-36 w-36 md:w-48 shrink-0 grow-0'
                        />
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
                        className='text-sm mt-3.5'
                    >
                        Get more
                    </Button>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
