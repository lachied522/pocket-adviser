"use client";
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
} from "react";

import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "@/actions/crud/holdings";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { Holding, Stock } from "@prisma/client";

export type PortfolioState = {
    holdings: Holding[]
    stockDataMap: { [id: number]: Stock }
    setStockDataMap: React.Dispatch<React.SetStateAction<{ [id: number]: Stock }>>
    insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<number>
    updateHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
    deleteHoldingAndUpdateState: (holdingId: number) => Promise<void>
}

const PortfolioContext = createContext<any>(null);

export const usePortfolioContext = () => {
    return useContext(PortfolioContext);
}

interface PortfolioProviderProps {
    children: React.ReactNode
    initialHoldings: Holding[]
    initialStocks: Stock[]
}

export const PortfolioProvider = ({
  children,
  initialHoldings,
  initialStocks,
}: PortfolioProviderProps) => {
    const { state } = useGlobalContext() as GlobalState;
    const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
    const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>(
        Object.fromEntries(initialStocks.map((stock) => ([stock.id, stock])))
    );

    const insertHoldingAndUpdateState = useCallback(
        async (holding: Omit<Holding, 'id'|'userId'>) => {
            const insertedHolding = await insertHoldingAction({
                ...holding,
                userId: state.id,
            });

            setHoldings((curr) => ([...curr, insertedHolding]));

            return insertedHolding.id;
        },
        [state.id, setHoldings]
    );

    const updateHoldingAndUpdateState = useCallback(
        async (holding: Omit<Holding, 'userId'>) => {
            const updatedHolding = await updateHoldingAction({
                ...holding,
                userId: state.id,
            });

            setHoldings((curr) => curr.map(
                (obj) => obj.id === updatedHolding.id? updatedHolding: obj
            ));
        },
        [state, setHoldings]
    );

    const deleteHoldingAndUpdateState = useCallback(
        async (holdingId: number) => {
        try {
            const deletedHolding = await deleteHoldingAction(holdingId);

            setHoldings((curr) => curr.filter(
                (obj) => obj.id !== deletedHolding.id
            ));
        } catch (e) {
            // TO DO: sometimes user deletes a holding that is not yet in DB, which will cause error
        }
        },
        [setHoldings]
    );


    return (
        <PortfolioContext.Provider
            value={{
                holdings,
                stockDataMap,
                setStockDataMap,
                insertHoldingAndUpdateState,
                updateHoldingAndUpdateState,
                deleteHoldingAndUpdateState,
            }}
        >
            {children}
        </PortfolioContext.Provider>
  )
}