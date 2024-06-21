"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { Stock } from "@prisma/client";

function formatMarketCap(marketCap: bigint|number|null) {
    if (!marketCap) return 'N/A';

    marketCap = Number(marketCap); // convert to Number type
    const trillion = 1e12;
    const billion = 1e9;
    const million = 1e6;

    if (Math.abs(marketCap) >= trillion) {
      return `$${(marketCap / trillion).toFixed(2)}T`;
    } else if (Math.abs(marketCap) >= billion) {
      return `$${(marketCap / billion).toFixed(2)}B`;
    } else if (Math.abs(marketCap) >= million) {
      return `$${(marketCap / million).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
}

interface StockModalProps {
    children: React.ReactNode
    stockId: any
}

export default function StockModal({ children, stockId }: StockModalProps) {
    const { getStockData } = useGlobalContext() as GlobalState;
    const [stockData, setStockData] = useState<Stock | null>(null);

    useEffect(() => {
        (async function getData() {
            console.log(typeof stockId);
            if (typeof stockId !== "number") return;

            const _data = await getStockData(stockId);
            if (_data) setStockData(_data);
        })();
    }, []);

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
                            {`${stockData.name} (${stockData.symbol.toUpperCase()})`}
                        </DialogTitle>
                    </DialogHeader>

                    <div className='flex flex-row gap-3.5'>
                        <div className='h-36 w-36 shrink-0 bg-slate-100 rounded-xl p-3'>
                            {stockData.image? (
                            <Image
                                src={stockData.image}
                                alt={stockData.symbol + " logo"}
                                height={120}
                                width={120}
                            />
                            ) : (
                            <div className='h-full w-full flex items-center justify-center text-sm'>
                                Logo not found
                            </div>
                            )}
                        </div>

                        <div className='flex flex-col justify-between'>
                            <span>{stockData.country} | {stockData.exchange}</span>
                            <div className='w-full flex flex-row justify-between gap-3.5'>
                                <div className='flex flex-col'>
                                    <span className='font-medium text-lg mr-1'>{formatMarketCap(stockData.marketCap)}</span>
                                    <span className='text-slate-600 text-sm'>Market Cap.</span>
                                </div>

                                <div className='flex flex-col'>
                                    <div className='inline'>
                                        <span className='font-medium text-lg mr-1'>{stockData.previousClose? formatDollar(stockData.previousClose): 'N/A'}</span>
                                        <span className='font-medium text-base'>{stockData.previousClose? stockData.currency: ''}</span>
                                    </div>
                                    <span className='text-slate-600 text-sm'>Prev. Close</span>
                                </div>

                                <div className='flex flex-col'>
                                    <span className='font-medium text-lg mr-1'>{formatDollar(stockData.dividendAmount || 0)}</span>
                                    <span className='text-slate-600 text-sm'>Div. Amount</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p>{stockData.description || 'Company information not available'}</p>
                </DialogContent>
            </Dialog>
            ) : (
            <>{children}</>
            )}
        </>
    )
}