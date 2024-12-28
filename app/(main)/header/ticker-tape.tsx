import { Suspense } from "react";
import Image from "next/image";

import { kv } from "@vercel/kv";

import { Skeleton } from "@/components/ui/skeleton";

import { FinancialModellingPrepClient } from "@/utils/financial_modelling_prep/client";

import StockDialog from "@/components/stocks/stock-dialog";
import ChangeIndicator from "@/components/stocks/change-indicator";

import AnimationWrapper from "./animation-wrapper";

type TapeItem = {
    symbol: string
    name: string
    exchange: string
    price: number
    change: number
}

type Tape = {
    index: TapeItem
    stocks: TapeItem[]
}

async function getTrendingStocks(
    client: FinancialModellingPrepClient,
    exchange?: "ASX"|"NASDAQ"
) {
    const quotes = await Promise.all(
        exchange?
        [client.getAllStocksByExchange(exchange)]:
        [client.getAllStocksByExchange("ASX"), client.getAllStocksByExchange("NASDAQ")]
    );

    // get list of 20 stocks sorted by percent change
    const sortedQuotes = quotes.flat()
    .filter((quote) => {
        if (quote.exchange === "ASX") return quote.marketCap > 5_000_000_000;
        return quote.marketCap > 50_000_000_000;
    })
    .sort((a, b) => Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage))
    .slice(0, 24);

    const profiles = await Promise.all(
        sortedQuotes.map((quote) => client.getCompanyProfile(quote.symbol))
    );

    // filter further by removing etfs and indeces
    return sortedQuotes.filter((quote) => {
        const profile = profiles.find((obj) => obj?.symbol === quote.symbol);
        if (profile) return (
            (profile.exchangeShortName !== "ASX" || profile.symbol.split('.')[0].length < 5) // remove ASX hybrid securities
            && !profile.isEtf
            && !profile.isFund
            && !profile.companyName.toLowerCase().includes('index')
        );
    })
    .map((quote) => ({
        symbol: quote.symbol,
        name: quote.name,
        exchange: quote.exchange,
        price: quote.previousClose,
        change: quote.changesPercentage,
    }));
}

async function getStockTape(exchange?: "ASX"|"NASDAQ"): Promise<Tape> {
    const key = exchange? `STOCK_TAPE_${exchange}`: `STOCK_TAPE`;
    let res: Tape | null = await kv.get(key);

    if (res) return res;

    // kv miss, fetch new data
    const client = new FinancialModellingPrepClient();
    const [index, stocks] = await Promise.all([
        exchange === "ASX"? client.getQuote("^AXJO"): client.getQuote("^SPX"),
        getTrendingStocks(client, exchange),
    ]);

    res = {
        index: {
            ...index!,
            change: index!.changesPercentage,
            exchange: exchange ?? "NASDAQ",
        },
        stocks,
    }

    // TO DO: this expiry should be longer than 24 hours in case of weekends
    kv.set(key, res, { ex: 24 * 60 * 60 });
    return res;
}

function StockTapeSkeleton() {
    return (
        <>
            {Array.from({ length: 24 }).map((_, index) => (
            <Skeleton
                key={`stock-tape-skeleton-${index}`}
                className='h-5 w-[120px] bg-zinc-100 shrink-0'
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
        <div className='flex flex-row items-center justify-between gap-1 md:gap-2 rounded-lg px-1.5 md:px-3'>
            <div className='h-3 md:h-3.5 w-3 md:w-3.5 relative'>
                <Image
                    src={exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                    alt='flag'
                    sizes='14px'
                    fill
                />
            </div>

            <span className='text-xs md:text-sm font-medium text-neutral-800'>
                {symbol.endsWith('.AX')? symbol.split('.')[0]: symbol}
            </span>

            <ChangeIndicator change={change} size='sm' />
        </div>
    )
}

async function StockTapeBody({ exchange } : { exchange?: "ASX" | "NASDAQ" }) {
    const { index, stocks } = await getStockTape(exchange);
    return (
        <>
            <TapeItem
                symbol={index.symbol}
                change={index.change}
                exchange={index.exchange}
            />
            
            <div className='flex flex-row items-center overflow-hidden'>
                {/* Display 2x stock tape */}
                {Array.from({ length: 2 }).map((_, index) => (
                <AnimationWrapper key={`tape-${index}`} className='flex flex-row items-center'>
                    {stocks.map((quote) => (
                    <StockDialog key={`tape-item-${quote.symbol}-${index}`} name={quote.name} symbol={quote.symbol}>
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

export default function TickerTape({ exchange } : { exchange?: "ASX" | "NASDAQ" }) {
    return (
        <div className='flex flex-row items-center justify-evenly py-2 gap-1 md:gap-2 overflow-hidden'>
            <Suspense fallback={<StockTapeSkeleton />}>
                <StockTapeBody exchange={exchange} />
            </Suspense>
        </div>
    )
}