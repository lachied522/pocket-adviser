import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import StockModal from "@/components/stocks/stock-modal";
import StockLogo from "@/components/stocks/stock-logo";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

import type { Stock } from "@prisma/client";

interface StockCardProps {
    stockData: Stock
}

export default function StockCard({ stockData }: StockCardProps) {
    return (
        <StockModal stockId={stockData.id}>
            <Card className='cursor-pointer'>
                <CardContent className='flex flex-col gap-3.5 p-3'>
                    <div className='flex flex-row gap-3.5'>
                        <div className='h-36 w-36 flex items-center justify-center shrink-0 bg-slate-100 rounded-xl p-3'>
                            <StockLogo symbol={stockData.symbol} />
                        </div>

                        <div className='flex flex-col'>
                            <div className='text-lg font-medium'>{stockData.name}</div>
                            <div className=''>{stockData.symbol}</div>
                            <div className='flex flex-row items-center gap-2'>
                                <Image
                                    src={stockData.exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                    alt='flag'
                                    height={16}
                                    width={16}
                                />
                                <span>{stockData.exchange}</span>
                            </div>
                        </div>
                    </div>

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
        </CardContent>
            </Card>
        </StockModal>
    )
}