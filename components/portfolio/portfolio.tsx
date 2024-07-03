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

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import { columns } from "./columns";
import StockTable from "./stock-table";
import EditPortfolioDialog from "./edit-portfolio-dialog";

import type { PopulatedHolding } from "@/types/helpers";

export default function Portfolio() {
    const { state, portfolioValue, currency, setCurrency, getStockData } = useGlobalContext() as GlobalState;
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // fetch stock data for each holding and update populated holdings
        (async function populateHoldings() {
            if (!state) return;

            setIsLoading(true);

            const _holdings = await Promise.all(
                state.holdings.map(async (holding) => {
                    const data = await getStockData(holding.stockId);
                    return { ...data, ...holding };
                })
            );

            setPopulatedHoldings(_holdings);
            setIsLoading(false);
        })();
    }, [state, getStockData]);

    return (
        <div className='flex flex-col gap-6'>
            <H3 className=''>My Portfolio</H3>
            <div className='w-full flex flex-row justify-between'>
                <div className='flex flex-row items-center gap-3.5'>
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

            <StockTable columns={columns} data={populatedHoldings} />
        </div>
    )
}