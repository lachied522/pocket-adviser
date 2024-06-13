"use client";
import {
  createContext,
  useState,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useMemo
} from "react";

import { type Action, GlobalReducer } from "./GlobalReducer";

import { getStockByIdAction } from "../actions/stocks";
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "../actions/holdings";

import type { Holding, Stock } from "@prisma/client";

export type GlobalState = {
  state: {
    portfolio: Holding[],
  }
  portfolioValue: number,
  // stockDataMap: { [symbol: string]: Stock }
  dispatch: React.Dispatch<Action>
  getStockData: (stockId: number) => Promise<Stock>
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
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>({});

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

  const portfolioValue = useMemo(() => {
    return state.portfolio.reduce(
      (acc, obj) => {
          if (obj.stockId in stockDataMap) {
            return acc + stockDataMap[obj.stockId].previousClose * obj.units;
          }
          return 0;
      },
      0
    )
  }, [state.portfolio, stockDataMap]);

  const getStockData = useCallback(
    async (stockId: number) => {
      if (stockId in stockDataMap) return stockDataMap[stockId];

      try {
        // fetch stock quote
        const data = await getStockByIdAction(stockId);
        if (!data) return;
        // update state
        setStockDataMap((curr) => ({ ...curr, [stockId]: data }));
        // return data
        return data;
      } catch (e) {
        console.error(e); // TO DO
      }

    },
    [stockDataMap, setStockDataMap]
  );

  const insertHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'id'>) => {
      const res = await insertHoldingAction(holding);
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
      const res = await updateHoldingAction(holding);
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
      const res = await deleteHoldingAction(holding);
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
        portfolioValue,
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