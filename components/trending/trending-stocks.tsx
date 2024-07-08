"use client";
import { useState, useEffect } from "react";

import { getTrendingStocksAction } from "@/actions/data/trending";

import { H3 } from "@/components/ui/typography";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import StockCard from "@/components/stocks/stock-card";

// import { GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { Stock } from "@prisma/client";

export default function TrendingStocks() {
    // const { getStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<Omit<Stock, 'id'>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async function getTrendingStocks() {
            const _data = await getTrendingStocksAction();
            setData(_data);
            setIsLoading(false);
        })();
    }, []);

    return (
        <div className='flex flex-row items-center gap-12'>
            <H3 className=''>Trending Stocks</H3>

            <ScrollArea>
                <div className='flex flex-row items-center p-2 gap-3.5 md:gap-6'>
                    {data && data.length > 0? (
                    <>
                        {data.map((stock) => (
                        <StockCard key={`trending-${stock.symbol}`} stockData={stock} size='sm' />
                        ))}
                    </>
                    ) : (
                    <>
                        {isLoading ? (
                        <>
                            {Array.from({length: 10}).map((_, index) => (
                                <Skeleton
                                    key={`skelton-${index}`}
                                    className='h-[78px] w-[180px]'
                                />
                            ))}
                        </>
                        ) : (
                        <div></div>
                        )}
                    </>
                    )}
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
        </div>
    )
}