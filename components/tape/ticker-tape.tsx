import { Suspense } from "react";
import Image from "next/image";

import { kv } from "@vercel/kv";

import { Skeleton } from "@/components/ui/skeleton";

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import StockDialog from "@/components/stocks/stock-dialog";
import ChangeIndicator from "@/components/stocks/change-indicator";

import AnimationWrapper from "./animation-wrapper";

async function getTrendingStocks(client: FinancialModellingPrepClient) {
    const [nasdaq, asx] = await Promise.all([
        client.getAllStocksByExchange("NASDAQ"),
        client.getAllStocksByExchange("ASX"),
    ]);

    // get list of 20 stocks sorted by percent change
    const quotes = [...nasdaq, ...asx]
    .filter((quote) => quote.marketCap > 50_000_000_000)
    .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage))
    .slice(0, 24);

    const profiles = await Promise.all(
        quotes.map((quote) => client.getCompanyProfile(quote.symbol))
    );

    // filter further by removing etfs and indeces
    return quotes.filter((quote) => {
        const profile = profiles.find((obj) => obj?.symbol === quote.symbol);
        if (profile) return !profile.isEtf && !profile.companyName.toLowerCase().includes('index')
    })
    .map((quote) => ({
        symbol: quote.symbol,
        name: quote.name,
        exchange: quote.exchange,
        price: quote.previousClose,
        change: quote.changesPercentage,
    }));
}

const KEY = "STOCK_TAPE";

type TapeItem = {
    symbol: string
    name: string
    exchange: string
    price: number
    change: number
}

type Tape = {
    indices: TapeItem[]
    stocks: TapeItem[]
}

async function getStockTape(): Promise<Tape> {
    let res: Tape | null = await kv.get(KEY);

    if (res) return res;
    
    // kv miss, fetch new data
    const client = new FinancialModellingPrepClient();
    const [spxQuote, stocks] = await Promise.all([
        client.getQuote("^SPX"),
        getTrendingStocks(client),
    ]);

    res = {
        indices: [{
            symbol: "SPY",
            exchange: "Index",
            name: "S&P 500 Index",
            price: spxQuote?.previousClose ?? 0,
            change: spxQuote?.changesPercentage ?? 0,
        }],
        stocks,
    }

    kv.set(KEY, res, { ex: 24 * 60 * 60 });
    return res;
}

function StockTapeSkeleton() {
    return (
        <>
            {Array.from({ length: 24 }).map((_, index) => (
            <Skeleton
                key={`stock-tape-skeleton-${index}`}
                className='h-[24px] w-[120px] bg-zinc-100 shrink-0'
            />
            ))}
        </>
    )
}

function TapeItem({
    symbol,
    exchange,
    change,
}: {
    symbol: string
    exchange: string
    change: number
}) {
    return (
        <div className='flex flex-row items-center justify-between gap-1 md:gap-2 rounded-lg px-1.5 md:px-3 py-1.5'>            
            <div className='h-3 md:h-3.5 w-3 md:w-3.5 relative'>
                <Image
                    src={exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                    alt='flag'
                    sizes='14px'
                    fill
                />
            </div>

            <span className='text-sm md:text-sm font-medium text-neutral-800'>
                {symbol.endsWith('.AX')? symbol.split('.')[0]: symbol}
            </span>

            <ChangeIndicator change={change} size='sm' />
        </div>
    )
}

async function StockTapeBody() {
    const data = await getStockTape();
    return (
        <>
            {/* Indices are not animated */}
            {data.indices.map((quote) => (
            <TapeItem
                key={`stock-tape-${quote.symbol}`}
                symbol={quote.symbol} change={quote.change} exchange={quote.exchange}
            />
            ))}
            
            <div className='flex flex-row items-center overflow-hidden'>
                {/* Display 2x stock tape */}
                {Array.from({ length: 2 }).map((_, index) => (
                <AnimationWrapper key={`stock-tape-${index}`} className='flex flex-row items-center'>
                    {data.stocks.map((quote) => (
                    <StockDialog name={quote.name} symbol={quote.symbol}>
                        <button className='shrink-0 hover:scale-[1.05]'>
                            <TapeItem symbol={quote.symbol} change={quote.change} exchange={quote.exchange} />
                        </button>
                    </StockDialog>
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