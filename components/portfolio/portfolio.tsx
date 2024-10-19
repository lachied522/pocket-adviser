"use client";
import { useState, useEffect } from "react";

import { Pencil } from "lucide-react";

import { H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/utils";

import { formatDollar } from "@/utils/formatting";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import { columns } from "./columns";
import StockTable from "./table";
import EditPortfolioDialog from "./edit-portfolio-dialog";

import type { PopulatedHolding } from "@/types/helpers";

const TABS = {
    overview: [
        "symbol",
        "name",
        "sector",
        "marketCap",
        "units",
        "previousClose",
        "changesPercentage",
        "value",
    ],
    earnings: [
        "symbol",
        "name",
        "marketCap",
        "units",
        "sector",
        "eps",
        "pe",
        "epsGrowth",
    ],
    dividends: [
        "symbol",
        "name",
        "marketCap",
        "sector",
        "units",
        "dividendAmount",
        "dividendYield",
        "dividendTotal"
    ]
}

export default function Portfolio() {
    const { state, portfolioValue, currency, setCurrency, getStockData } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [tab, setTab] = useState<keyof typeof TABS>("overview");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isMobile = useMediaQuery();

    useEffect(() => {
        // fetch stock data for each holding and update populated holdings
        (async function populateHoldings() {
            if (!state) return;

            setIsLoading(true);

            const _holdings = await Promise.all(
                state.holdings.map(async (holding) => {
                    const data = await getStockData(holding.stockId);
                    // add value column
                    const value = holding.units * (data.previousClose || 0);
                    // add total income
                    const dividendTotal = holding.units * (data.dividendAmount || 0);
                    // add EPS column
                    // NOTE: only pe ratio is stored in DB
                    // TODO: store eps in db instead of pe
                    const eps = (data.pe && data.previousClose)? Math.round(100 * data.previousClose / data.pe) / 100: NaN;
                    return {
                        ...data,
                        ...holding,
                        value,
                        dividendTotal,
                        eps,
                    };
                })
            );

            setPopulatedHoldings(_holdings);
            setIsLoading(false);
        })();
    }, [state, getStockData]);

    return (
        <div className='flex flex-col gap-3.5 md:gap-6'>
            <H3 className=''>My Portfolio</H3>

            <div className='hidden md:flex flex-row items-center gap-3.5'>
                <div className=''>
                    Market Value <span className='text-lg font-medium'>{formatDollar(portfolioValue)}</span>
                </div>
                <Select onValueChange={(value: "USD"|"AUD") => setCurrency(value)} defaultValue={currency}>
                    <SelectTrigger className='w-[80px]'>
                        <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent className='w-[80px]'>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='w-full flex flex-row items-start justify-between gap-3.5'>
                <div className='hidden md:flex flex-wrap items-center gap-2'>
                    <Button
                        onClick={() => setTab("overview")}
                        variant='outline'
                        className={cn(tab === 'overview' && 'border border-sky-600')}
                    >
                        Overview
                    </Button>
                    <Button
                        onClick={() => setTab("earnings")}
                        variant='outline'
                        className={cn(tab === 'earnings' && 'border border-sky-600')}
                    >
                        Earnings
                    </Button>
                    <Button
                        onClick={() => setTab("dividends")}
                        variant='outline'
                        className={cn(tab === 'dividends' && 'border border-sky-600')}
                    >
                        Dividends
                    </Button>
                </div>

                <EditPortfolioDialog>
                    <Button
                        variant='outline'
                        className='flex flex-row gap-2'
                    >
                        <Pencil size={16} />
                        Edit Portfolio
                    </Button>
                </EditPortfolioDialog>
            </div>

            <StockTable
                columns={
                    columns.filter((column) => {
                        const cols = isMobile? ['symbol', 'units', 'value']: TABS[tab];
                        // @ts-ignore: issue with ColumnDef type https://github.com/TanStack/table/issues/4241
                        return cols.includes(column.accessorKey)
                    })
                }
                data={populatedHoldings}
                emptyComponent={(
                    <div className='flex flex-col items-center gap-3 md:gap-6 p-3 md:p-24'>
                        <span className='font-medium text-lg'>Portfolio empty. Need ideas?</span>
                        <Button
                            onClick={() => {
                                onSubmit("Can you give me some ideas for my portfolio?", "getRecommendations");
                                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                            }}
                        >
                            Get started
                        </Button>
                    </div>
                )}
            />
        </div>
    )
}