"use client";
import {
  createContext,
  useState,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useRef
} from "react";
import { useSession } from "next-auth/react";

import { getUserDataAction, updateUserAction } from "@/actions/crud/user";
import { updateProfileAction } from "@/actions/crud/profile";
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "@/actions/crud/holdings";
import { getStockByIdAction } from "@/actions/data/stocks";
import { getForexPriceAction } from "@/actions/data/forex";

import { useCookies } from "@/hooks/useCookies";

import { type Action, GlobalReducer } from "./GlobalReducer";

import type { Holding, Profile, Stock, User } from "@prisma/client";
import type { UserData } from "@/types/helpers";

export type GlobalState = {
  state: UserData | null
  portfolioValue: number
  currency: 'USD'|'AUD'
  dispatch: React.Dispatch<Action>
  setCurrency: React.Dispatch<React.SetStateAction<'USD'|'AUD'>>
  getStockData: (stockId: number) => Promise<Stock>
  updateUserAndUpdateState: (user: Partial<User>) => Promise<void>
  updateProfileAndUpdateState: (profile: Omit<Profile, 'userId'>) => Promise<void>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<void>
  updateHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
  deleteHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
  initialUserData: UserData|null
  initialStockData: { [id: number]: Stock }
  initalForexRate: number
}

export const GlobalProvider = ({
  children,
  initialUserData,
  initialStockData,
  initalForexRate,
}: GlobalProviderProps) => {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(GlobalReducer, initialUserData);
  const { getUserIdFromCookies, setUserIdCookie, setIsGuestCookie, createGuestUserIfNecessary } = useCookies();
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>(initialStockData);
  const [forexRate, setForexRate] = useState<number>(initalForexRate); // USDAUD forex rate
  const [currency, setCurrency] = useState<'USD'|'AUD'>("USD");

  useEffect(() => {
    (async function () {
      let data: UserData|null = null;
      if (session) {
        data = await getUserDataAction(session.user.id);
        setIsGuestCookie(false);
      } else {
        // guest users do not have session, fetch from cookies instead
        const _guestId = getUserIdFromCookies();
        if (_guestId) {
          // do not create a new guest if guestId does not exist - only create when necessary
          data = await getUserDataAction(_guestId);
          // update cookie
          setIsGuestCookie(true);
        }
      };
      
      if (!data) return;
      // update state
      dispatch({
        type: 'SET_DATA',
        payload: data,
      });

      // ensure cookies are synced with session
      setUserIdCookie(data.id);
    })();
  }, [session]);

  const portfolioValue = useMemo(() => {
    if (!state) return 0;
    return state.holdings.reduce(
      (acc, obj) => {
          const stock = stockDataMap[obj.stockId];
          if (stock) {
              let multiplier = 1;
              if (currency === "USD" && stock.exchange === "ASX") {
                  multiplier /= forexRate;
              } else if (currency === "AUD" && stock.exchange === "NASDAQ") {
                  multiplier *= forexRate;
              }
              return acc + multiplier * (stock.previousClose || 0) * obj.units;
          }
          return 0;
      },
      0
    )
  }, [state, stockDataMap, currency, forexRate]);

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

  const updateUserAndUpdateState = useCallback(
    async (data: Partial<User>) => {
        if (!state) return;

        await updateUserAction(state.id, data);
        
        // update state
        dispatch({
            type: 'SET_DATA',
            payload: {
                ...state,
                ...data,
            }
        })
    },
    [state, dispatch]
  );

  const updateProfileAndUpdateState = useCallback(
    async (profile: Omit<Profile, 'userId'>) => {
      let userId = state?.id;
      if (!userId) {
        userId = await createGuestUserIfNecessary() as string;
      }

      const res = await updateProfileAction({
        ...profile,
        userId,
      });
      // update state
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: res
      });

      console.log('state updated', profile);

    },
    [state]
  );

  const insertHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'id'|'userId'>) => {
      let userId = state?.id;
      if (!userId) {
        userId = await createGuestUserIfNecessary() as string;
      }
      const res = await insertHoldingAction({
        ...holding,
        userId,
      });

      // update state
      dispatch({
        type: 'INSERT_HOLDING',
        payload: res,
      })
    },
    [state, dispatch]
  );

  const updateHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'userId'>) => {
      if (!state) return; // this should not happen

      const res = await updateHoldingAction({
        ...holding,
        userId: state.id,
      });
      // update state
      dispatch({
        type: 'UPDATE_HOLDING',
        payload: res
      })
    },
    [state, dispatch]
  );

  const deleteHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'userId'>) => {
      if (!state) return; //
      const res = await deleteHoldingAction({
        ...holding,
        userId: state.id,
      });
      // update state
      dispatch({
        type: 'DELETE_HOLDING',
        payload: res
      })
    },
    [state, dispatch]
  );

  return (
    <GlobalContext.Provider
      value={{
        state,
        portfolioValue,
        currency,
        getStockData,
        setCurrency,
        updateUserAndUpdateState,
        updateProfileAndUpdateState,
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