"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";

import { Plus, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getNewsAction } from "@/actions/news";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { StockNews } from "@/types/api";

export default function NewsCarousel() {
    const { state, getStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<StockNews[]|null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!data) getNews();

        async function getNews() {
            if (!state) return; // TO DO

            const symbols = [];
            for (const holding of state.holdings) {
                const { symbol } = await getStockData(holding.stockId);
                symbols.push(symbol);
            }
            const _data = await getNewsAction(symbols);
            setData(_data);
        };
    }, [state]);

    const handleDragStart = (e: React.DragEvent<HTMLAnchorElement>, article: StockNews) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(article));
    }

    return (
        <div className='flex flex-col items-end'>
            <div className='flex flex-col mr-3 mb-3'>
                <Button
                    variant='ghost'
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex flex-col items-end hover:bg-transparent'
                >
                    <h4 className='text-lg'>News</h4>
                    <span className='text-sm text-slate-600'>{isOpen? "Hide": "Show"}</span>
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    key='news-carousel'
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{
                        ease: "easeOut",
                        duration: 0.12,
                    }}
                >
                    {data && data.length > 0 ? (
                    <>
                        <div className='text-sm text-slate-600 ml-4 mb-3'>Tip: try dragging an article to the left</div>
                        <ScrollArea className="h-[640px] flex flex-col px-3">
                            {data.map((article) => (
                            <a
                                key={`article-${article.title}`}
                                href={article.url}
                                target="_blank"
                                draggable={true}
                                onDragStart={(e: React.DragEvent<HTMLAnchorElement>) => handleDragStart(e, article)}
                                className="flex flex-col items-center justify-start p-2"
                            >
                                <div className="h-36 w-48 rounded-xl relative overflow-hidden cursor-pointer hover:scale-[1.05]">
                                    <Image
                                        src={article.image}
                                        alt="Article Image"
                                        fill
                                        style={{
                                            objectFit: "cover"
                                        }}
                                    />
                                    <div className="z-10 flex-1 flex flex-col justify-end bg-gradient-to-b from-transparent to-black absolute inset-0">
                                        <div className="flex flex-col px-3 py-2">
                                            <span className="text-sm text-white font-medium line-clamp-1">{article.title}</span>
                                            <span className="text-xs text-white line-clamp-2">{article.text}</span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                            ))}
                        </ScrollArea>
                    </>
                    ) : (
                    <div>
                        No articles were found.
                    </div>
                    )}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
