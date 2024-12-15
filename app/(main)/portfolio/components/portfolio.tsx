"use client";
import { useState, useMemo } from "react";

import { Link, Pencil } from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { useChatNavigation } from "@/hooks/useChatNavigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type PortfolioState, usePortfolioContext } from "../context";
import { columns } from "./columns";
import PortfolioTable from "./portfolio-table";
import EditPortfolioDialog from "./edit-portfolio-dialog";

const TABS = {
    overview: [
        "symbol",
        "name",
        "sector",
        "marketCap",
        "units",
        "previousClose",
        "change",
        "value",
    ],
    earnings: [
        "symbol",
        "name",
        "marketCap",
        "units",
        "sector",
        "eps",
        "peRatio",
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
    const { holdings, stockDataMap } = usePortfolioContext() as PortfolioState;
    const [portfolioValue, setPortfolioValue] = useState<number>(0);
    const [tab, setTab] = useState<keyof typeof TABS>("overview");
    const [currency, setCurrency] = useState<"AUD"|"USD">("AUD");
    const { onSubmit } = useChatNavigation();
    const isMobile = useMediaQuery();

    // useEffect(() => {
    //     (async function updatePortfolioValue() {
    //         setPortfolioValue(await calcPortfolioValue(currency));
    //     })();
    // }, [currency]);

    const populatedHoldings = useMemo(() => {
        return holdings.map((holding) => {
            const stock = stockDataMap[holding.stockId];
            // add value column
            const value = holding.units * (stock.previousClose || 0);
            // add total income
            const dividendTotal = holding.units * (stock.dividendAmount || 0);
            // add EPS column
            // NOTE: only pe ratio is stored in DB
            // TODO: store eps in db instead of pe
            const eps = (stock.peRatio && stock.previousClose)? Math.round(100 * stock.previousClose / stock.peRatio) / 100: NaN;
            return {
                ...stock,
                ...holding,
                value,
                dividendTotal,
                eps,
            }
        })
    }, [holdings, stockDataMap]);

    return (
        <>
            <div className='w-full flex flex-row items-center justify-end gap-3 py-6'>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant='outline'
                            className='flex flex-row gap-2 justify-start'
                            disabled
                        >
                            <Link size={16} />
                            Link broker
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="top"
                        align="center"
                    >
                        Coming soon
                    </TooltipContent>
                </Tooltip>

                <EditPortfolioDialog>
                    <Button
                        variant='outline'
                        className='flex flex-row gap-2 justify-start'
                    >
                        <Pencil size={16} />
                        Edit portfolio
                    </Button>
                </EditPortfolioDialog>
            </div>

            <PortfolioTable
                columns={
                    columns.filter((column) => {
                        const cols = isMobile? ['symbol', 'units', 'previousClose', 'value']: TABS[tab];
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
                                onSubmit("What can I buy with $1000?", { toolName: "getRecommendations" });
                            }}
                        >
                            Get started
                        </Button>
                    </div>
                )}
            />
        </>
    )
}