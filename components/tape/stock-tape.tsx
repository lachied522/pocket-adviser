"use client";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import { getStockTapeAction } from "@/actions/data/tape";

import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/container";

import TapeItem from "./tape-item";

import type { Stock } from "@prisma/client";

export default function StockTape() {
    const [indeces, setIndeces] = useState<Pick<Stock, 'symbol'|'name'|'previousClose'|'changesPercentage'>[]>([]);
    const [stocks, setStocks] = useState<Omit<Stock, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async function getTrendingStocks() {
            const res = await getStockTapeAction();
            setIndeces(res.indeces);
            setStocks(res.stocks);
            setIsLoading(false);
        })();
    }, []);

    return (
        <Container>
            <div className='w-full flex flex-row items-center py-2 gap-3.5 justify-evenly overflow-hidden'>
                {isLoading ? (
                <>
                    {Array.from({length: 10}).map((_, index) => (
                    <Skeleton
                        key={`skelton-${index}`}
                        className='h-[36px] w-[180px] bg-slate-50/20'
                    />
                    ))}
                </>
                ) : (
                <>
                    {indeces.map((item) => (
                    <TapeItem key={`trending-${item.symbol}`} data={item} />
                    ))}
                    <div className='flex flex-row items-center gap-3.5 overflow-hidden'>
                        <motion.div
                            animate={{
                                translateX: '-100%',
                                transition: {
                                    ease: "linear",
                                    repeat: Infinity,
                                    duration: 60,
                                }
                            }}
                            className='flex flex-row items-center gap-3.5'
                        >
                            {stocks.map((stock) => (
                            <TapeItem key={`stock-tape-1-${stock.symbol}`} data={stock} clickable />
                            ))}
                        </motion.div>
                        <motion.div
                            animate={{
                                translateX: '-100%',
                                transition: {
                                    ease: "linear",
                                    repeat: Infinity,
                                    duration: 60,
                                }
                            }}
                            className='flex flex-row items-center gap-3.5'
                        >
                            {stocks.map((stock) => (
                            <TapeItem key={`stock-tape-2-${stock.symbol}`} data={stock} clickable />
                            ))}
                        </motion.div>
                    </div>
                </>
                )}
            </div>
        </Container>
    )
}