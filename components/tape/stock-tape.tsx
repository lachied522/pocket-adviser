import { Suspense } from "react";

import { getStockTape } from "@/utils/data/tape";

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

export default function StockTape() {
    return (
        <Container>
            <div className='w-full flex flex-row items-center px-1 py-2 gap-3.5 justify-evenly overflow-hidden'>
                <Suspense fallback={<StockTapeSkeleton />}>
                    <StockTapeBody />
                </Suspense>
            </div>
        </Container>
    )
}