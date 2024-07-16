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
            {data.indeces.map((item) => (
            <TapeItem key={`trending-${item.symbol}`} data={item} />
            ))}
            <div className='flex flex-row items-center gap-3.5 overflow-hidden'>
                <AnimationWrapper>
                    {data.stocks.map((stock) => (
                    <TapeItem key={`stock-tape-1-${stock.symbol}`} data={stock} clickable />
                    ))}
                </AnimationWrapper>
                <AnimationWrapper>
                    {data.stocks.map((stock) => (
                    <TapeItem key={`stock-tape-2-${stock.symbol}`} data={stock} clickable />
                    ))}
                </AnimationWrapper>
            </div>
        </>
    )
}

export default function StockTape() {
    return (
        <Container>
            <div className='w-full flex flex-row items-center py-2 gap-3.5 justify-evenly overflow-hidden'>
                <Suspense fallback={<StockTapeSkeleton />}>
                    <StockTapeBody />
                </Suspense>
            </div>
        </Container>
    )
}