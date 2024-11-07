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

import { createUserAction, updateUserAction } from "@/actions/crud/user";
import { updateProfileAction } from "@/actions/crud/profile";
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "@/actions/crud/holdings";
import { insertConversationAction, updateConversationAction, deleteConversationAction } from "@/actions/crud/conversation";
import { getStockByIdAction } from "@/actions/data/stocks";

import { getUserIdFromCookies, setUserIdCookie, setIsGuestCookie } from "@/utils/cookies";

import { type Action, GlobalReducer } from "./GlobalReducer";

import type { Conversation, Holding, Profile, Stock, User } from "@prisma/client";
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
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<number>
  updateHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
  deleteHoldingAndUpdateState: (holdingId: number) => Promise<void>
  insertConversationAndUpdateState: (conversation: Omit<Conversation, 'id'|'userId'|'createdAt'|'updatedAt'>) => Promise<string>
  updateConversationAndUpdateState: (conversation: Pick<Conversation, 'id'|'name'>) => Promise<void>
  deleteConversationAndUpdateState: (conversationId: string) => Promise<void>
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
  const [state, dispatch] = useReducer(GlobalReducer, initialUserData);
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>(initialStockData);
  const [currency, setCurrency] = useState<'USD'|'AUD'>("USD");
  const [forexRate] = useState<number>(initalForexRate); // USDAUD forex rate

  const createGuestUserIfNecessary = useCallback(
    async () => {
      // check if userId already exists in cookies to avoid unnecessary user creation
      const _userId = getUserIdFromCookies();
      if (_userId) {
          console.log('user retrieved from cookies');
          return _userId;
      };
    
      const _user = await createUserAction({ guest: true });
      console.log('guest created');
    
      // set cookies
      setUserIdCookie(_user.id);
      setIsGuestCookie(true);
      // update state
      dispatch({
        type: 'SET_DATA',
        payload: {
            ..._user,
            holdings: [],
            conversations: [],
            profile: null,
        } satisfies UserData,
      });
      return _user.id;
    },
    [dispatch]
  );

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
      });

      return res.id;
    },
    [state, dispatch]
  );

  const updateHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'userId'>) => {
      if (!state) return;

      const res = await updateHoldingAction({
        ...holding,
        userId: state.id,
      });

      // update state
      dispatch({
        type: 'UPDATE_HOLDING',
        payload: res
      });
    },
    [state, dispatch]
  );

  const deleteHoldingAndUpdateState = useCallback(
    async (holdingId: number) => {
      if (!state) return;

      try {
        const res = await deleteHoldingAction(holdingId);

        // update state
        dispatch({
          type: 'DELETE_HOLDING',
          payload: res.id
        });
      } catch (e) {
        // TO DO: sometimes user deletes a holding that is not yet in DB, which will cause error
      }
    },
    [state, dispatch]
  );

  const insertConversationAndUpdateState = useCallback(
    async (conversation: Omit<Conversation, 'id'|'userId'|'createdAt'|'updatedAt'>) => {
      let userId = state?.id;
      if (!userId) {
          userId = await createGuestUserIfNecessary() as string;
      }

      const res = await insertConversationAction({
        ...conversation,
        userId,
      });

      // update state
      dispatch({
        type: 'INSERT_CONVERSATION_START',
        payload: {
            id: res.id,
            name: res.name,
        }
      });

      return res.id;
    },
    [state, dispatch]
  );

  const updateConversationAndUpdateState = useCallback(
    async (conversation: Omit<Conversation, 'userId'>) => {
      if (!state) return;

      const res = await updateConversationAction(conversation.id, conversation);

      // update state
      dispatch({
        type: 'UPDATE_CONVERSATION',
        payload: {
          id: res.id,
          name: res.name,
        }
      });
    },
    [state, dispatch]
  );

  const deleteConversationAndUpdateState = useCallback(
    async (conversationId: string) => {
      if (!state) return;

      const res = await deleteConversationAction(conversationId);

      // update state
      dispatch({
        type: 'DELETE_CONVERSATION',
        payload: res.id,
      });
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
        insertConversationAndUpdateState,
        updateConversationAndUpdateState,
        deleteConversationAndUpdateState,
        dispatch
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};