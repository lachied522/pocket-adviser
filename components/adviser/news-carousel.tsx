"use client";
import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { getNewsAction } from "@/actions/news";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import NewsArticle from "./news-article";

import type { StockNews } from "@/types/api";

export default function NewsCarousel() {
    const { state, getStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<StockNews[]|null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    useEffect(() => {
        getNews();

        async function getNews() {
            const symbols = [];
            if (state && state.holdings) {
                for (const holding of state.holdings) {
                    const { symbol } = await getStockData(holding.stockId);
                    symbols.push(symbol);
                }
            }
            const _data = await getNewsAction(symbols);
            setData(_data);
            setIsLoading(false);
        };
    }, []);

    return (
        <div className='flex flex-col items-stretch'>
            <div className='flex xl:justify-end xl:mb-3'>
                <Button
                    variant='ghost'
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex flex-row xl:flex-col items-center xl:items-end gap-2 xl:gap-0 hover:bg-transparent p-0'
                >
                    <h4 className='text-lg'>News</h4>
                    <span className='text-sm text-slate-600'>{isOpen? "Hide": "Show"}</span>
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    key='news-carousel'
                    // initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '-100%' }}
                    transition={{
                        ease: "easeOut",
                        duration: 0.32,
                    }}
                >
                    {data && data.length > 0 ? (
                    <>
                        <div className='text-sm text-slate-600 xl:ml-4 xl:mb-3'>Tip: try dragging an article to the left</div>
                        <ScrollArea className=''>
                            <div className='z-[-1] xl:h-[640px] flex flex-row xl:flex-col py-3 xl:px-3 xl:py-0'>
                                {data.map((article) => (
                                <NewsArticle
                                    key={`article-${article.title}`}
                                    article={article}
                                    draggable
                                    animateOnHover
                                />
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </>
                    ) : (
                    <>
                        {isLoading ? (
                        <div className='w-full flex items-center justify-center p-6'>
                            <LoaderCircle className='animate-spin text-slate-200' />
                        </div>
                        ) : (
                        <div>
                            No articles were found.
                        </div>
                        )}
                    </>
                    )}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
