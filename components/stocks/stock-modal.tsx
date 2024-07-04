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
import { type AdviserState, useChatContext } from "@/context/ChatContext";

import StockLogo from "./stock-logo";
import ChangeIndicator from "./change-indicator";

import type { Stock } from "@prisma/client";

type StockWithoutId = Omit<Stock, 'id'> & { id?: number }

interface StockModalProps {
    children: React.ReactNode
    initialStockData?: StockWithoutId|null // data can be passed from parent or fetched by id
    stockId?: any
}

export default function StockModal({ children, stockId, initialStockData }: StockModalProps) {
    const { getStockData } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as AdviserState;
    const [stockData, setStockData] = useState<StockWithoutId|null|undefined>(initialStockData);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (initialStockData) return; // data already populated
        if (typeof stockId !== "number") return;
        (async function getData() {
            const _data = await getStockData(stockId);
            if (_data) setStockData(_data);
        })();
    }, [stockId, getStockData]);

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

                    <div className='flex flex-row gap-3.5'>
                        <div className='h-36 w-36 flex items-center justify-center shrink-0 bg-slate-100 rounded-xl p-3'>
                            <StockLogo symbol={stockData.symbol} />
                        </div>

                        <div className='flex flex-col justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                <span>{stockData.symbol.toUpperCase()}</span>
                                <Image
                                    src={stockData.exchange==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                    alt='flag'
                                    height={16}
                                    width={16}
                                />
                                <span>{stockData.exchange}</span>
                            </div>

                            <div className='w-full flex flex-row items-center gap-3.5'>
                                <div className='flex flex-col'>
                                    <div className='inline'>
                                        <span className='font-medium text-lg mr-0.5'>{stockData.previousClose? formatDollar(stockData.previousClose): 'N/A'}</span>
                                        <span className='font-medium text-sm'>{stockData.previousClose? stockData.currency: ''}</span>
                                    </div>
                                    <span className='text-slate-600 text-sm'>Prev. Close.</span>
                                </div>
                                <div className='flex flex-col'>
                                    <ChangeIndicator change={stockData.changesPercentage} withIcon={false} />
                                    <span className='text-slate-600 text-sm'>Change</span>
                                </div>
                            </div>

                            <div className='w-full flex flex-row justify-between gap-3.5'>
                                <div className='flex flex-col'>
                                    <span className='font-medium text-lg'>{formatMarketCap(stockData.marketCap)}</span>
                                    <span className='text-slate-600 text-sm'>Market Cap.</span>
                                </div>

                                <div className='flex flex-col'>
                                    <span className='font-medium text-lg'>{stockData.sector}</span>
                                    <span className='text-slate-600 text-sm'>Sector</span>
                                </div>

                                <div className='flex flex-col'>
                                    <span className='font-medium text-lg'>{formatDollar(stockData.dividendAmount || 0)}</span>
                                    <span className='text-slate-600 text-sm'>Div. Amount</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className='h-[360px] p-3'>
                        <p className='text-base'>{stockData.description || 'Company information not available'}</p>
                    </ScrollArea>

                    <DialogFooter>
                        <DialogClose ref={closeRef} className='hidden' />
                        <div className='w-full flex flex-row justify-around gap-3.5'>
                            <Button onClick={() => onButtonPress(`What's new with ${stockData.symbol}?`)}>
                                What&apos;s new with {stockData.symbol}?
                            </Button>
                            <Button onClick={() => onButtonPress(`Should I buy ${stockData.symbol}?`)}>
                                Should I buy {stockData.symbol}?
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            ) : (
            <>{children}</>
            )}
        </>
    )
}