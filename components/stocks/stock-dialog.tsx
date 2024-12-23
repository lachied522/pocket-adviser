"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { MessageCircleQuestion } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/utils";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

import { getStockBySymbolAction } from "@/actions/data/stocks";

import { useChatNavigation } from "@/hooks/useChatNavigation";

import ChangeIndicator from "./change-indicator";
import StockLogo from "./stock-logo";
import Overview from "./overview";
import Statistics from "./statistics";
import Income from "./income";
import BalanceSheet from "./balance-sheet";
import Cashflow from "./cashflow";

import type { CompanyOutlook } from "@/utils/financial_modelling_prep/types";

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
    },
]

interface StockModalProps {
    children: React.ReactNode
    symbol: string
    name: string
}

export default function StockDialog({ children, symbol, name }: StockModalProps) {
    const { onSubmit } = useChatNavigation();
    const [stockData, setStockData] = useState<CompanyOutlook | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) fetchStockData();

        async function fetchStockData() {
            try {
                setStockData(await getStockBySymbolAction(symbol));
            } catch (e) {
                setError(true);
            }
            setIsLoading(false);
        }
    }, [isOpen, symbol]);

    return (
        <Dialog open={isOpen} onOpenChange={(value: boolean) => setIsOpen(value)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='h-dvh w-full max-w-[100vw] flex flex-col border-none shadow-none rounded-none'>
                <div className='max-w-6xl mx-auto md:mb-3'>
                    <DialogHeader>
                        <DialogTitle>
                            {name}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {(isLoading || stockData) && (
                <>
                    <div className='max-w-6xl grid grid-cols-[60px_1fr] md:grid-cols-[120px_1fr] items-start gap-x-2 sm:gap-x-6 gap-y-2 mx-auto'>
                        <div className='h-14 w-14 md:h-auto md:w-auto flex items-center justify-center bg-zinc-100 rounded-xl aspect-square md:row-span-2'>
                            <div className='h-10 w-10 md:h-24 md:w-24 flex relative'>
                                {!stockData || isLoading ? (
                                <Skeleton className='flex-1' />
                                ) : (
                                <StockLogo
                                    symbol={stockData.profile.symbol}
                                    fill
                                />
                                )}
                            </div>
                        </div>
                        
                        <div className='md:col-span-1 grid grid-rows-1 grid-cols-2 md:grid-cols-4 grid-flow-col-dense gap-3 divide-x'>
                            {!stockData || isLoading ? (
                            <div className='flex flex-col items-start gap-1'>
                                <Skeleton className='h-6 w-[120px]' />
                                <Skeleton className='h-8 w-[180px]' />
                            </div>
                            ) : (
                            <div className='flex flex-col items-start'>
                                <div className='flex flex-row items-center gap-2'>
                                    <span>{stockData.profile.symbol.toUpperCase()}</span>
                                    <Image
                                        src={stockData.profile.exchange==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                        alt='flag'
                                        height={16}
                                        width={16}
                                    />
                                </div>

                                <div className='flex flex-row items-center gap-2'>
                                    <div className='inline'>
                                        <span className='font-medium text-sm md:text-base mr-0.5'>
                                            {formatDollar(stockData.profile.price)}
                                        </span>
                                        <span className='font-medium text-sm'>
                                            {stockData.profile.currency}
                                        </span>
                                    </div>

                                    <ChangeIndicator
                                        change={100 * stockData.profile.changes / stockData.profile.price}
                                        withIcon={false}
                                        size='sm'
                                    />
                                </div>
                            </div>)}
                            
                            {!stockData || isLoading ? (
                            <Skeleton className='hidden md:block' />
                            ) : (
                            <div className='hidden md:flex flex-col items-center'>
                                <span className='font-medium text-base md:text-lg'>{formatMarketCap(stockData.profile.mktCap)}</span>
                                <span className='text-zinc-600 text-xs md:text-sm'>Market Cap.</span>
                            </div>
                            )}

                            {!stockData || isLoading ? (
                            <Skeleton className='hidden md:block' />
                            ) : (
                            <div className='hidden md:flex flex-col items-center'>
                                <span className='font-medium text-base md:text-lg line-clamp-1'>{stockData.profile.sector ?? "N/A"}</span>
                                <span className='text-zinc-600 text-xs md:text-sm'>Sector</span>
                            </div>
                            )}

                            {!stockData || isLoading ? (
                            <Skeleton />
                            ) : (
                                <div className='flex flex-col items-center'>

                                    {stockData.rating.length > 0 ? (
                                    <span className={cn(
                                        'font-medium text-base md:text-lg line-clamp-1',
                                        stockData.rating[0].ratingRecommendation.includes("Sell") && 'text-red-400',
                                        stockData.rating[0].ratingRecommendation.includes("Buy") && 'text-green-400',
                                    )}>
                                        {stockData.rating[0].ratingRecommendation}
                                    </span>
                                    ) : (
                                    <span className='font-medium text-base md:text-lg'>N/A</span>
                                    )}
                                    <span className='text-zinc-600 text-xs md:text-sm'>Analyst Rating</span>
                                </div>
                            )}
                        </div>

                        <div className='col-span-2 md:col-auto flex flex-row items-center justify-between gap-1 md:gap-2 pb-1 md:px-2 overflow-x-auto'>
                            {!stockData || isLoading ? (
                            <>
                            {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={`prompt-skeleton-${index}`}
                                className='h-9 w-[180px] shrink-0'
                            />
                            ))}
                            </>
                            ) : (
                            <>
                                {prompts(stockData.profile.symbol).map((obj, index) => (
                                <Button
                                    key={`prompt-${stockData.profile.symbol}-${index}`}
                                    variant='outline'
                                    onClick={() => {
                                        onSubmit(obj.input, { toolName: obj.tool });
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className='text-xs md:text-sm'>{obj.display}</span>
                                </Button>
                                ))}
                            </>
                            )}
                        </div>
                    </div>

                    <Tabs
                        defaultValue="overview"
                        className="flex-1 flex flex-col justify-center overflow-hidden"
                    >
                        <TabsList className='w-full max-w-6xl justify-between bg-transparent border-b border-zinc-200 mx-auto'>
                            <TabsTrigger value="overview" className='' disabled={!stockData || isLoading}>
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="statistics" className='' disabled={!stockData || isLoading}>
                                Statistics
                            </TabsTrigger>
                            <TabsTrigger value="income" className='' disabled={!stockData || isLoading}>
                                Income
                            </TabsTrigger>
                            <TabsTrigger value="balance-sheet" className='' disabled={!stockData || isLoading}>
                                Balance Sheet
                            </TabsTrigger>
                            <TabsTrigger value="cashflow" className='' disabled={!stockData || isLoading}>
                                Cashflow
                            </TabsTrigger>
                        </TabsList>

                        <div className='max-h-full h-full overflow-y-auto'>
                            <TabsContent value="overview" className='max-w-6xl mx-auto'>
                                {isLoading ? (
                                <div className='flex flex-col gap-6 pt-6'>
                                    <Skeleton className='h-[360px] md:h-[520px] w-full'/>
                        
                                    <Skeleton className='h-[360px] w-full'/>
                                </div>
                                ) : (
                                <Overview stockData={stockData!} />
                                )}
                            </TabsContent>
                            
                            <TabsContent value="statistics" className='max-w-6xl mx-auto'>
                                <Statistics stockData={stockData!} />
                            </TabsContent>

                            <TabsContent value="income" className='max-w-6xl mx-auto'>
                                <Income stockData={stockData!} />
                            </TabsContent>

                            <TabsContent value="balance-sheet" className='max-w-6xl mx-auto'>
                                <BalanceSheet stockData={stockData!} />
                            </TabsContent>

                            <TabsContent value="cashflow" className='max-w-6xl mx-auto'>
                                <Cashflow stockData={stockData!} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </>
                )}

                {error && (
                <div className='w-full text-center my-auto'>
                    <span>Something went wrong fetching data for {symbol}</span>
                </div>
                )}

                {(!isLoading && !stockData && !error) && (
                <div className='w-full text-center my-auto'>
                    <span>Could not find data on {symbol}</span>
                </div>
                )}
            </DialogContent>
        </Dialog>
    )
}