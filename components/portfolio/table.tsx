"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "../ui/data-table";

import { type GlobalState, useGlobalContext } from "@/app/context/GlobalContext";

import { columns } from "./columns";

import type { Holding } from "@prisma/client";
import type { PopulatedHolding } from "@/types/helpers";


export default function PortfolioTable() {
    const { state: { portfolio }, getStockData } = useGlobalContext() as GlobalState;
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const populateHoldings = useCallback(async (holdings: Holding[]) => {
        setIsLoading(true);

        await Promise.all(holdings.map(async (holding) => {
            // check that symbol is not already in populated holdings
            // if (populatedHoldings.find((obj) => obj.symbol === holding.symbol)) return;

            const data = await getStockData(holding.symbol);
            const populatedHolding = { ...holding, ...data };
            setPopulatedHoldings((curr) => {
                const _holding = curr.find((obj) => obj.symbol === holding.symbol);
                if (_holding) {
                    // update existing holding instead of appending new one
                    return curr.map((obj) => obj.symbol === holding.symbol? populatedHolding: obj);
                }
                return [...curr, populatedHolding];
            });
        }));

        setIsLoading(false);
    }, [setIsLoading, getStockData, setPopulatedHoldings]);

    useEffect(() => {
        // fetch stock data for each holding and update populated holdings
        if (!isLoading) populateHoldings(portfolio);
    }, [portfolio, populateHoldings]);

    return (
        <div>
            <DataTable columns={columns} data={populatedHoldings} />
        </div>
    )
}