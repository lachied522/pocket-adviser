import { Suspense } from "react";

import { getStockTape } from "@/utils/financial_modelling_prep/tape";

import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/ui/container";

import TapeItem from "./tape-item";
import AnimationWrapper from "./animation-wrapper";

function StockTapeSkeleton() {
    return (
        <>
            {Array.from({length: 10}).map((_, index) => (
            <Skeleton
                key={`skelton-${index}`}
                className='h-[36px] w-[180px] bg-slate-50/20'
            />
            ))}
        </>
    )
}

async function StockTapeBody() {
    const data = await getStockTape();
    return (
        <>
            {/* Indices are not animated */}
            {data.indeces.map((item) => (
            <TapeItem key={`trending-${item.symbol}`} data={item} />
            ))}
            
            <div className='flex flex-row items-center overflow-hidden'>
                {/* Display 2x stock tape */}
                {Array.from({ length: 2 }).map((_, index) => (
                <AnimationWrapper key={`stock-tape-${index}`} className='flex flex-row items-center'>
                    {data.stocks.map((stock) => (
                    <TapeItem key={`stock-tape-${index}-${stock.symbol}`} data={stock} clickable />
                    ))}
                </AnimationWrapper>
                ))}
            </div>
        </>
    )
}

export default function TickerTape() {
    return (
        <div className='flex flex-row items-center justify-evenly px-1 md:px-2 py-2 gap-1 md:gap-3 overflow-hidden'>
            <Suspense fallback={<StockTapeSkeleton />}>
                <StockTapeBody />
            </Suspense>
        </div>
    )
}