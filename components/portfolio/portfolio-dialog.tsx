"use client";
import { useState, useEffect, useCallback } from "react";

import { Pencil } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import PortfolioTable from "./table";
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

interface PortfolioDialogProps {
    children: React.ReactNode
}

export default function PortfolioDialog({ children }: PortfolioDialogProps) {
    const { state, calcPortfolioValue, getStockData } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [portfolioValue, setPortfolioValue] = useState<number>(0);
    const [tab, setTab] = useState<keyof typeof TABS>("overview");
    const [currency, setCurrency] = useState<"AUD"|"USD">("AUD");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isMobile = useMediaQuery();

    // useEffect(() => {
    //     (async function updatePortfolioValue() {
    //         setPortfolioValue(await calcPortfolioValue(currency));
    //     })();
    // }, [currency]);

    useEffect(() => {
        // fetch stock data for each holding and update populated holdings
        (async function populateHoldings() {
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
    }, [state.holdings, getStockData]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='h-dvh w-full max-w-[100vw] border-none shadow-none rounded-none overflow-auto'>
                <div className='w-full max-w-6xl flex flex-col mx-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            Portfolio
                        </DialogTitle>
                        <DialogDescription>
                            Tell Pocket Adviser what you have in your portfolio so that it can provide personalised responses.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='w-full flex flex-row items-start justify-between gap-3 py-6'>
                        <div className='hidden md:flex flex-wrap items-center gap-2'>
                            <Button
                                onClick={() => setTab("overview")}
                                variant='outline'
                                className={cn(tab === 'overview' && 'border border-primary')}
                            >
                                Overview
                            </Button>
                            <Button
                                onClick={() => setTab("earnings")}
                                variant='outline'
                                className={cn(tab === 'earnings' && 'border border-primary')}
                            >
                                Earnings
                            </Button>
                            <Button
                                onClick={() => setTab("dividends")}
                                variant='outline'
                                className={cn(tab === 'dividends' && 'border border-primary')}
                            >
                                Dividends
                            </Button>
                        </div>

                        <EditPortfolioDialog>
                            <Button
                                variant='outline'
                                className='flex flex-row gap-2 justify-start font-medium py-3 border border-neutral-600'
                            >
                                <Pencil size={16} />
                                Edit portfolio
                            </Button>
                        </EditPortfolioDialog>
                    </div>

                    {/* <div className='hidden md:flex flex-row items-center gap-3 py-3'>
                        <div className=''>
                            Market Value <span className='text-lg font-medium'>{formatDollar(portfolioValue)}</span>
                        </div>
                        <Select onValueChange={(value: "USD"|"AUD") => setCurrency(value)} defaultValue={currency}>
                            <SelectTrigger className='w-[80px]'>
                                <SelectValue placeholder="USD" />
                            </SelectTrigger>
                            <SelectContent className='w-[80px]'>
                                <SelectItem value="AUD">AUD</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    <PortfolioTable
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
                                        onSubmit("What can I buy with $1000?", "getRecommendations");
                                        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                                    }}
                                >
                                    Get started
                                </Button>
                            </div>
                        )}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}