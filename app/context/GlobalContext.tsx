"use client";
import {
  createContext,
  useState,
  useCallback,
  useContext,
  useReducer,
  useEffect
} from "react";

import { type Action, GlobalReducer } from "./GlobalReducer";

import { getStock } from "../actions/stocks";
import { deleteHolding, getHoldings, insertHolding, updateHolding } from "../actions/crud/holdings";

import type { Holding, Stock } from "@prisma/client";

export type GlobalState = {
  state: {
    portfolio: Holding[],
  }
  stockDataMap: { [symbol: string]: Stock }
  dispatch: React.Dispatch<Action>
  getStockData: (symbol: string) => Promise<Stock>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'>) => Promise<void>
  updateHoldingAndUpdateState: (holding: Holding) => Promise<void>
  deleteHoldingAndUpdateState: (holding: Holding) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode,
  initialState: Holding[]
}

export const GlobalProvider = ({
  children,
  initialState,
}: GlobalProviderProps) => {
  const [state, dispatch] = useReducer(GlobalReducer, { portfolio: initialState });
  const [stockDataMap, setStockDataMap] = useState<{ [symbol: string]: Stock }>({});

  // useEffect(() => {
  //   let isMounted = false;
  //   // fetch initial data
  //   (async function () {
  //     if (isMounted) return; // prevent useEffect from running twice
  //     const data = await getHoldings();
  //     // update state
  //     dispatch({
  //       type: 'SET_DATA',
  //       payload: { portfolio: data }
  //     });

  //     isMounted = true;
  //   })();
  // }, []);

  const getStockData = useCallback(
    async (symbol: string) => {
      if (symbol in stockDataMap) return stockDataMap[symbol];

      try {
        // fetch stock quote
        const data = await getStock(symbol);
        if (!data) return;
        // update state
        setStockDataMap((curr) => ({ ...curr, [symbol]: data }));
        // return data
        console.log('new data fetched')
        return data;
      } catch (e) {
        console.error(e); // TO DO
      }

    },
    [stockDataMap, setStockDataMap]
  )

  const insertHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'id'>) => {
      const res = await insertHolding(holding);
      // update state
      dispatch({
        type: 'INSERT_HOLDING',
        payload: res,
      })
    },
    [dispatch]
  );

  const updateHoldingAndUpdateState = useCallback(
    async (holding: Holding) => {
      const res = await updateHolding(holding);
      console.log(holding.id, res.id);
      // update state
      dispatch({
        type: 'UPDATE_HOLDING',
        payload: res
      })
      console.log('holding updated', res);
    },
    [dispatch]
  );

  const deleteHoldingAndUpdateState = useCallback(
    async (holding: Holding) => {
      const res = await deleteHolding(holding);
      // update state
      dispatch({
        type: 'DELETE_HOLDING',
        payload: res
      })
    },
    [dispatch]
  );

  return (
    <GlobalContext.Provider
      value={{
        state,
        getStockData,
        insertHoldingAndUpdateState,
        updateHoldingAndUpdateState,
        deleteHoldingAndUpdateState,
        dispatch
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};