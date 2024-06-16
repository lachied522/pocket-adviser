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

import type { Holding, Profile, Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";
import { updateProfileAction } from "@/actions/profile";

export type GlobalState = {
  state: UserData | null
  portfolioValue: number
  // stockDataMap: { [symbol: string]: Stock }
  dispatch: React.Dispatch<Action>
  getStockData: (stockId: number) => Promise<Stock>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<void>
  updateHoldingAndUpdateState: (holding: Holding) => Promise<void>
  deleteHoldingAndUpdateState: (holding: Holding) => Promise<void>
  updateProfileAndUpdateState: (profile: Omit<Profile, 'userId'>) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
  initialState: UserData | null
}

export const GlobalProvider = ({
  children,
  initialState,
}: GlobalProviderProps) => {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(GlobalReducer, initialState);
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>({});
  const { getGuestFromCookies, createGuestUserIfNecessary } = useGuest();

  useEffect(() => {
    // fetch initial data
    (async function () {
      let data: UserData|null = null;
      if (session) {
        data = await getUserDataAction(session.user.id);
      } else {
        const _guestId = getGuestFromCookies();
        console.log('guest', _guestId)
        if (_guestId) {
          // do not create a new guest if guestId does not exist - only create when necessary
          data = await getUserDataAction(_guestId);
        }
      };
      
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
      let userId = state?.id;
      if (!userId) {
        userId = await createGuestUserIfNecessary();
      }
      const res = await insertHoldingAction({
        ...holding,
        userId,
      });

      console.log({res});
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

  const updateProfileAndUpdateState = useCallback(
    async (profile: Omit<Profile, 'userId'>) => {
      let userId = state?.id;
      if (!userId) {
        userId = await createGuestUserIfNecessary();
      }

      const res = await updateProfileAction({
        ...profile,
        userId: userId,
      })
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: res
      });

      console.log('state updated', profile);

    },
    [state]
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
        updateProfileAndUpdateState,
        dispatch
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};