"use client";
import { useState, useEffect, useCallback } from "react";

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

    const getNews = useCallback(
        async (nextPage: number) => {
            return await getNewsAction(symbols, nextPage, 20);
        },
        [symbols]
    );

    useEffect(() => {
        (async function populatePage() {
            setIsLoading(true);
            const _data = await getNews(page);
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
    }, [page, getNews]);

    return (
        <div className='hidden sm:flex flex-col items-stretch gap-2 xl:gap-3.5'>
            <div className='flex flex-row items-center xl:flex-col xl:items-start gap-x-1 gap-y-2'>
                <h4 className='md:text-lg font-medium'>News</h4>

                {data.length > 0 && <div className='hidden md:block text-xs'>Tip: drag an article into the chat</div>}
            </div>

            <ScrollArea className='xl:h-[660px]'>
                <div className='flex flex-row xl:flex-col items-center pb-2 xl:py-0 gap-2'>
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
                        <Skeleton
                            key={`news-skelton-${index}`}
                            className='h-24 xl:h-32 w-36 xl:w-44 shrink-0 grow-0'
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
                        className='text-sm xl:mt-3.5'
                    >
                        Get more
                    </Button>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}
