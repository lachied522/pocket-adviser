import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

import StockModal from "@/components/stocks/stock-modal";
import StockLogo from "@/components/stocks/stock-logo";
import ChangeIndicator from "@/components/stocks/change-indicator";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

import type { Stock } from "@prisma/client";

interface StockCardProps {
    stockData: Omit<Stock, 'id'> & { id?: number }
    size?: 'sm'|'lg'
}

export default function StockCard({ stockData, size = 'lg' }: StockCardProps) {
    return (
        <StockModal initialStockData={stockData}>
            <Card className='cursor-pointer shrink-0'>
                <CardContent className='flex flex-col gap-3.5 p-3'>
                    <div className={cn('flex flex-row gap-3.5', size === 'sm' && 'items-center')}>
                        <div className='flex items-center justify-center bg-slate-100 rounded-xl p-3 aspect-square shrink-0'>
                            <StockLogo
                                symbol={stockData.symbol}
                                height={size ==='lg'? 120: 30}
                                width={size ==='lg'? 120: 30}
                            />
                        </div>

                        <div className='flex flex-col'>
                            <div className='max-w-[180px] md:text-lg font-medium truncate'>{stockData.name}</div>
                            <div className={cn('flex flex-row items-center gap-2', size==='sm' && 'gap-3.5')}>
                                <span className={cn(size === 'sm' && 'text-sm md:text-base')}>{stockData.symbol}</span>
                                <Image
                                    src={stockData.exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                    alt='flag'
                                    height={16}
                                    width={16}
                                />
                               {size === 'lg' && (<span>{stockData.exchange}</span>)}
                               {size === 'sm' && (
                                <div className=''>
                                    <ChangeIndicator change={stockData.changesPercentage} size='sm' />
                                </div>
                               )}
                            </div>
                        </div>
                    </div>

                    {size === 'lg' && (
                    <div className='w-full flex flex-row justify-between gap-3.5'>
                        <div className='flex flex-col'>
                            <span className='font-medium text-lg mr-1'>{formatMarketCap(stockData.marketCap)}</span>
                            <span className='text-slate-600 text-sm'>Market Cap.</span>
                        </div>

                        <div className='flex flex-col'>
                            <div className='inline'>
                                <span className='font-medium text-lg mr-1'>{stockData.previousClose? formatDollar(stockData.previousClose): 'N/A'}</span>
                                <span className='font-medium text-sm'>{stockData.previousClose? stockData.currency: ''}</span>
                            </div>
                            <span className='text-slate-600 text-sm'>Prev. Close</span>
                        </div>

                        <div className='flex flex-col'>
                            <ChangeIndicator change={stockData.changesPercentage} withIcon={false} />
                            <span className='text-slate-600 text-sm'>Change</span>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
        </StockModal>
    )
}