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

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import StockLogo from "./stock-logo";
import ChangeIndicator from "./change-indicator";
import StockChart from "./stock-chart";

import type { Stock } from "@prisma/client";
import { Bot } from "lucide-react";

const prompts = (symbol: string) => [
    {
        display: `What's new with ${symbol}?`, // displayed on the button
        input: `What's the latest news for ${symbol}?`, // input passed to chat endpoint
        tool: "getStockNews", // tool AI is required to use
    },
    {
        display: 'What are analysts saying?',
        input: `What are analysts saying about ${symbol}?`,
        tool: "getAnalystResearch",
    },
    {
        display: 'What are some similar stocks?',
        input: `What are some similar stocks to ${symbol}?`,
        tool: "searchWeb",
    },
    {
        display: `Should I buy ${symbol}?`,
        input: `Should I buy ${symbol}?`,
        tool: "shouldBuyOrSellStock",
    },
]

type StockWithoutId = Omit<Stock, 'id'> & { id?: number }

interface StockModalProps {
    children: React.ReactNode
    initialStockData?: StockWithoutId|null // data can be passed from parent or fetched by id
    stockId?: any
}

export default function StockDialog({ children, stockId, initialStockData }: StockModalProps) {
    const { getStockData } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;
    const [stockData, setStockData] = useState<StockWithoutId|null|undefined>(initialStockData);
    const closeRef = useRef<HTMLButtonElement>(null);
    const isMobile = useMediaQuery();

    useEffect(() => {
        if (initialStockData) return; // data already populated
        if (typeof stockId !== "number") return;
        (async function getData() {
            const _data = await getStockData(stockId);
            if (_data) setStockData(_data);
        })();
    }, [initialStockData, stockId, getStockData]);

    const onButtonPress = (input: string, tool?: string) => {
        onSubmit(input, tool);
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <>
            {stockData? (
            <Dialog>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className='h-screen w-full max-w-[100vw] flex flex-col border-none shadow-none rounded-none overflow-auto'>
                    <div className='w-full max-w-6xl mx-auto overflow-auto'>
                        <DialogHeader>
                            <DialogTitle>
                                {stockData.name}
                            </DialogTitle>
                        </DialogHeader>

                        <div className='grid grid-cols-[60px_1fr] md:grid-cols-[120px_1fr] items-start gap-x-2 sm:gap-x-6 gap-y-2 py-6'>
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
                                        <span className='font-medium text-base md:text-lg mr-0.5'>{stockData.previousClose? formatDollar(stockData.previousClose): 'N/A'}</span>
                                        <span className='font-medium text-sm'>{stockData.previousClose? stockData.currency: ''}</span>
                                    </div>
                                    <ChangeIndicator
                                        change={stockData.changesPercentage}
                                        withIcon={false}
                                        size={isMobile? 'sm': 'lg'}
                                    />
                                </div>
                            </div>

                            <div className='col-span-2 md:col-span-1 grid grid-rows-1 grid-cols-4 sm:grid-cols-6 grid-flow-col-dense divide-x'>
                                <div className=''>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg'>{formatMarketCap(stockData.marketCap)}</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>Market Cap.</span>
                                    </div>
                                </div>

                                <div className='w-full flex items-center justify-center'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg line-clamp-1'>{stockData.sector}</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>Sector</span>
                                    </div>
                                </div>

                                <div className='w-full flex items-center justify-center'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg'>{formatDollar(stockData.dividendAmount || 0)}</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>Div. Amount</span>
                                    </div>
                                </div>

                                <div className='w-full flex items-center justify-center'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg'>{(100 * (stockData.dividendYield || 0)).toFixed(2)}%</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>Div. Yield</span>
                                    </div>
                                </div>

                                <div className='w-full hidden sm:flex items-center justify-center'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg'>{stockData.pe ?? 'N/A'}</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>PE Ratio</span>
                                    </div>
                                </div>

                                <div className='w-full hidden sm:flex items-center justify-center'>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-base md:text-lg'>{stockData.epsGrowth? (100 * stockData.epsGrowth).toFixed(2) + '%': 'N/A'}</span>
                                        <span className='text-slate-600 text-xs md:text-sm'>EPS Growth</span>
                                    </div>
                                </div>
                            </div>

                            <div className='h-[360px] md:h-[520px] col-span-2 mt-6'>
                                <StockChart stockData={stockData} />
                            </div>
                        </div>

                        <p className='text-sm sm:text-base'>{stockData.description || 'Company information not available'}</p>

                        <div className='flex flex-col sm:flex-row items-center justify-center gap-1 md:gap-2 py-6'>
                            {/* <Bot size={20} /> */}
                            <div className='flex-1 w-full flex flex-wrap justify-center gap-1 md:gap-2 order-2 sm:order-none'>
                                {prompts(stockData.symbol).map((obj, index) => (
                                <Button
                                    key={`prompt-${stockData.symbol}-${index}`}
                                    onClick={() => onButtonPress(obj.input, obj.tool)}
                                    className='hover:scale-[1.02] transition-transform duration-150'
                                >
                                    <span className='text-xs md:text-sm'>{obj.display}</span>
                                </Button>
                                ))}
                            </div>
                        </div>
                        <DialogClose ref={closeRef} className='hidden' />
                    </div>
                </DialogContent>
            </Dialog>
            ) : (
            <>{children}</>
            )}
        </>
    )
}