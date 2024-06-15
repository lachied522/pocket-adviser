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
import { useSession } from "next-auth/react";

import { type Action, GlobalReducer } from "./GlobalReducer";

import { getUserDataAction } from "../actions/user";
import { getStockByIdAction } from "../actions/stocks";``
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "../actions/holdings";

import { useGuest } from "@/hooks/useGuest";

import type { Holding, Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

export type GlobalState = {
  state: UserData
  portfolioValue: number
  // stockDataMap: { [symbol: string]: Stock }
  dispatch: React.Dispatch<Action>
  getStockData: (stockId: number) => Promise<Stock>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<void>
  updateHoldingAndUpdateState: (holding: Holding) => Promise<void>
  deleteHoldingAndUpdateState: (holding: Holding) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
}

export const GlobalProvider = ({
  children,
}: GlobalProviderProps) => {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(GlobalReducer, null);
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>({});
  const { createGuestUser } = useGuest();

  useEffect(() => {
    // fetch initial data
    (async function () {
      if (state) return;
      if (!session) {
        createGuestUser();
        return;
      };
      // get session
      const data = await getUserDataAction(session.user.id);
      console.log('data fetched', data);
      if (!data) return;
      // update state
      dispatch({
        type: 'SET_DATA',
        payload: data,
      });
    })();
  }, [session]);

  const portfolioValue = useMemo(() => {
    if (!state) return 0;
    return state.holdings.reduce(
      (acc, obj) => {
          if (obj.stockId in stockDataMap) {
            return acc + stockDataMap[obj.stockId].previousClose * obj.units;
          }
          return 0;
      },
      0
    )
  }, [state, stockDataMap]);

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
    async (holding: Omit<Holding, 'id'|'userId'>) => {
      if (!state) {
        console.log('state undefined')
        return;
      }

      const res = await insertHoldingAction({
        ...holding,
        userId: state.id,
      });
      console.log('res', res);
      // update state
      dispatch({
        type: 'INSERT_HOLDING',
        payload: res,
      })
    },
    [state, dispatch]
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