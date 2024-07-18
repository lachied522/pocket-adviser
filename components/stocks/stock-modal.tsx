"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import StockLogo from "./stock-logo";
import ChangeIndicator from "./change-indicator";
import StockChart from "./stock-chart";

import type { Stock } from "@prisma/client";

type StockWithoutId = Omit<Stock, 'id'> & { id?: number }

interface StockModalProps {
    children: React.ReactNode
    initialStockData?: StockWithoutId|null // data can be passed from parent or fetched by id
    stockId?: any
}

export default function StockModal({ children, stockId, initialStockData }: StockModalProps) {
    const { getStockData } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;
    const [stockData, setStockData] = useState<StockWithoutId|null|undefined>(initialStockData);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (initialStockData) return; // data already populated
        if (typeof stockId !== "number") return;
        (async function getData() {
            const _data = await getStockData(stockId);
            if (_data) setStockData(_data);
        })();
    }, [initialStockData, stockId, getStockData]);

    const onButtonPress = (content: string) => {
        onSubmit(content);
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <>
            {stockData? (
            <Dialog>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {stockData.name}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className='max-h-[80vh]'>
                        <div className='grid grid-cols-[60px_1fr] md:grid-cols-[120px_1fr] items-start gap-x-2 sm:gap-x-6 gap-y-2'>
                            <div className='h-14 w-14 md:h-auto md:w-auto flex items-center justify-center bg-slate-100 rounded-xl aspect-square md:row-span-2'>
                                <div className='h-10 w-10 md:h-24 md:w-24 relative'>
                                    <StockLogo
                                        symbol={stockData.symbol}
                                        fill
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col items-start gap-2'>
                                <div className='flex flex-row items-center gap-2'>
                                    <span>{stockData.symbol.toUpperCase()}</span>
                                    <Image
                                        src={stockData.exchange==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                        alt='flag'
                                        height={16}
                                        width={16}
                                    />
                                </div>
                                <div className='flex flex-row items-center gap-2'>
                                    <div className='inline'>
                                        <span className='font-medium text-lg mr-0.5'>{stockData.previousClose? formatDollar(stockData.previousClose): 'N/A'}</span>
                                        <span className='font-medium text-sm'>{stockData.previousClose? stockData.currency: ''}</span>
                                    </div>
                                    <ChangeIndicator change={stockData.changesPercentage} withIcon={false} />
                                </div>
                            </div>

                            <div className='col-span-2 md:col-span-1 flex flex-row justify-between gap-2'>
                                <div className='flex flex-col'>
                                    <span className='font-medium text-base md:text-lg'>{formatMarketCap(stockData.marketCap)}</span>
                                    <span className='text-slate-600 text-xs md:text-sm'>Market Cap.</span>
                                </div>

                                <div className='flex flex-col'>
                                    <span className='font-medium text-base md:text-lg'>{stockData.sector}</span>
                                    <span className='text-slate-600 text-xs md:text-sm'>Sector</span>
                                </div>

                                <div className='flex flex-col'>
                                    <span className='font-medium text-base md:text-lg'>{formatDollar(stockData.dividendAmount || 0)}</span>
                                    <span className='text-slate-600 text-xs md:text-sm'>Div. Amount</span>
                                </div>
                            </div>

                            <div className='col-span-2 md:px-6 xl:px-12 mt-6'>
                                <div className='h-48 opacity-90 md:p-0'>
                                    <StockChart stockData={stockData} />
                                </div>
                            </div>
                        </div>

                        <ScrollArea className='h-[360px] p-3'>
                            <p className='text-base'>{stockData.description || 'Company information not available'}</p>
                        </ScrollArea>

                        <DialogFooter>
                            <div className='w-full flex flex-wrap justify-center gap-1 md:gap-2'>
                                <Button
                                    onClick={() => onButtonPress(`What's new with ${stockData.symbol}?`)}
                                    className='px-2 py-1 md:px-4 md:py-2'
                                >
                                    <span className='text-xs md:text-base'>What&apos;s new with {stockData.symbol}?</span>
                                </Button>
                                <Button
                                    onClick={() => onButtonPress(`What are analysts saying about ${stockData.symbol}?`)}
                                    className='px-2 py-1 md:px-4 md:py-2'
                                >
                                    <span className='text-xs md:text-base'>What are analysts saying?</span>
                                </Button>
                                <Button
                                    onClick={() => onButtonPress(`What are some similar stocks to ${stockData.symbol}?`)}
                                    className='px-2 py-1 md:px-4 md:py-2'
                                >
                                    <span className='text-xs md:text-base'>What are some similar stocks?</span>
                                </Button>
                                <Button
                                    onClick={() => onButtonPress(`Should I buy ${stockData.symbol}?`)}
                                    className='px-2 py-1 md:px-4 md:py-2'
                                >
                                    <span className='text-xs md:text-base'>Should I buy {stockData.symbol}?</span>
                                </Button>
                            </div>
                        </DialogFooter>
                    </ScrollArea>
                    <DialogClose ref={closeRef} className='hidden' />
                </DialogContent>
            </Dialog>
            ) : (
            <>{children}</>
            )}
        </>
    )
}