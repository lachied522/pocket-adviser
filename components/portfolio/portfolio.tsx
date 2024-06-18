"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { H3 } from "@/components/ui/typography";
import { DataTable } from "@/components/ui/data-table";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import { columns } from "./columns";
import SearchBar from "./seach-bar";

import type { Holding } from "@prisma/client";
import type { PopulatedHolding } from "@/types/helpers";

export default function Portfolio() {
    const { state, getStockData } = useGlobalContext() as GlobalState;
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const populateHoldings = useCallback(async (holdings: Holding[]) => {
        setIsLoading(true);

        await Promise.all(holdings.map(async (holding) => {
            // check that symbol is not already in populated holdings
            // if (populatedHoldings.find((obj) => obj.symbol === holding.symbol)) return;

            const data = await getStockData(holding.stockId);
            const populatedHolding = { ...holding, ...data };
            setPopulatedHoldings((curr) => {
                const _holding = curr.find((obj) => obj.id === holding.stockId);
                if (_holding) {
                    // update existing holding instead of appending new one
                    return curr.map((obj) => obj.id === holding.stockId? populatedHolding: obj);
                }
                return [...curr, populatedHolding];
            });
        }));

        setIsLoading(false);
    }, [setIsLoading, getStockData, setPopulatedHoldings]);

    useEffect(() => {
        // fetch stock data for each holding and update populated holdings
        if (!isLoading) populateHoldings(state?.holdings || []);
    }, [state, populateHoldings]);

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-row justify-between'>
                <H3 className=''>My Portfolio</H3>

                <SearchBar />
            </div>

            <DataTable columns={columns} data={populatedHoldings} />
        </div>
    )
}