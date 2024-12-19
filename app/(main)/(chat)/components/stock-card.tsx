import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

import StockDialog from "@/components/stocks/stock-dialog";
import StockLogo from "@/components/stocks/stock-logo";
import ChangeIndicator from "@/components/stocks/change-indicator";

import { formatDollar, formatMarketCap } from "@/utils/formatting";

interface StockCardProps {
    symbol: string
    name: string
    exchange: string
    previousClose: number
    changePercent: number
    marketCap: number
}

export default function StockCard({
    symbol,
    name,
    exchange,
    previousClose,
    changePercent,
    marketCap
}: StockCardProps) {
    return (
        <StockDialog symbol={symbol} name={name}>
            <Card className='cursor-pointer shrink-0'>
                <CardContent className='flex flex-col gap-3.5 p-3'>
                    <div className='grid grid-cols-[60px_1fr] gap-2'>
                        <div className='h-12 w-12 flex items-center justify-center bg-zinc-100 rounded-xl p-2 aspect-square'>
                            <div className='h-8 w-8 relative'>
                                <StockLogo
                                    symbol={symbol}
                                    fill
                                />
                            </div>
                        </div>

                        <div className='flex flex-col'>
                            <div className='max-w-[180px] md:text-lg font-medium truncate'>{name}</div>
                            <div className='flex flex-row items-center gap-2'>
                                <span className='text-sm md:text-base'>{symbol}</span>
                                <Image
                                    src={exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                                    alt='flag'
                                    height={16}
                                    width={16}
                                />
                               <span>{exchange}</span>
                            </div>
                        </div>
                    </div>

                    <div className='w-full flex flex-row justify-between gap-3.5'>
                        <div className='flex flex-col'>
                            <span className='font-medium text-lg mr-1'>{formatMarketCap(marketCap)}</span>
                            <span className='text-slate-600 text-sm'>Market Cap.</span>
                        </div>

                        <div className='flex flex-col'>
                            <div className='inline'>
                                <span className='font-medium text-lg mr-1'>{previousClose? formatDollar(previousClose): 'N/A'}</span>
                            </div>
                            <span className='text-slate-600 text-sm'>Prev. Close</span>
                        </div>

                        <div className='flex flex-col'>
                            <ChangeIndicator change={changePercent} withIcon={false} />
                            <span className='text-slate-600 text-sm'>Change</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </StockDialog>
    )
}