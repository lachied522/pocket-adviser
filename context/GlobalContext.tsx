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

import { getUserDataAction } from "@/actions/user";
import { getStockByIdAction } from "@/actions/stocks";
import { getForexPriceAction } from "@/actions/forex";
import { updateProfileAction } from "@/actions/profile";
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "@/actions/holdings";

import { useCookies } from "@/hooks/useCookies";

import WelcomeDialog from "@/components/modals/welcome-dialog";

import { type Action, GlobalReducer } from "./GlobalReducer";

import type { Holding, Profile, Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

export type GlobalState = {
  state: UserData | null
  portfolioValue: number
  dispatch: React.Dispatch<Action>
  getStockData: (stockId: number) => Promise<Stock>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<void>
  updateHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
  deleteHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
  updateProfileAndUpdateState: (profile: Omit<Profile, 'userId'>) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
  initialUserData: UserData | null
  initialStockData: { [id: number]: Stock }
}

export const GlobalProvider = ({
  children,
  initialUserData,
  initialStockData,
}: GlobalProviderProps) => {
  const { data: session, status } = useSession();
  const [state, dispatch] = useReducer(GlobalReducer, initialUserData);
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>(initialStockData);
  const { getUserIdFromCookies, setUserIdCookie, setIsGuestCookie, createGuestUserIfNecessary } = useCookies();
  const welcomeDialogRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (async function () {
      if (state) return;
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
          if (obj.stockId in stockDataMap) {
            return acc + (stockDataMap[obj.stockId].previousClose || 0) * obj.units;
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
      <WelcomeDialog openRef={welcomeDialogRef} />
    </GlobalContext.Provider>
  );
};