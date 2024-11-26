"use client";
import {
  createContext,
  useState,
  useCallback,
  useContext,
  useReducer,
} from "react";

import { updateUserAction } from "@/actions/crud/user";
import { updateProfileAction } from "@/actions/crud/profile";
import { getStockByIdAction } from "@/actions/crud/stocks";
import { insertHoldingAction, updateHoldingAction, deleteHoldingAction } from "@/actions/crud/holdings";
import { getForexRateAction } from "@/actions/data/forex";

import { type Action, GlobalReducer } from "./GlobalReducer";

import type { Conversation, Holding, Profile, Stock, User } from "@prisma/client";
import type { UserData } from "@/types/helpers";

export type GlobalState = {
  state: UserData
  dispatch: React.Dispatch<Action>
  getStockData: (stockId: number) => Promise<Stock>
  calcPortfolioValue: (currency?: 'AUD'|'USD') => Promise<number>
  updateUserAndUpdateState: (user: Partial<User>) => Promise<void>
  updateProfileAndUpdateState: (profile: Omit<Profile, 'userId'>) => Promise<void>
  insertHoldingAndUpdateState: (holding: Omit<Holding, 'id'|'userId'>) => Promise<number>
  updateHoldingAndUpdateState: (holding: Omit<Holding, 'userId'>) => Promise<void>
  deleteHoldingAndUpdateState: (holdingId: number) => Promise<void>
  insertConversation: (conversation: Pick<Conversation, 'id'|'name'|'updatedAt'>) => void
  updateConversationName: (conversation: Pick<Conversation, 'id'|'name'>) => void
  deleteConversation: (conversationId: string) => Promise<void>
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
  initialUserData: UserData
  initialStockData: { [id: number]: Stock }
}

export const GlobalProvider = ({
  children,
  initialUserData,
  initialStockData,
}: GlobalProviderProps) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialUserData);
  const [stockDataMap, setStockDataMap] = useState<{ [id: number]: Stock }>(initialStockData);
  const [forexMap, setForexMap] = useState<{ [currency: string ]: number }>({});

  const getStockData = useCallback(
    async (stockId: number) => {
      if (stockId in stockDataMap) return stockDataMap[stockId];

      try {
        // fetch stock quote
        const data = await getStockByIdAction(stockId);
        if (!data) return;
        setStockDataMap((curr) => ({ ...curr, [stockId]: data }));
        return data;
      } catch (e) {
        console.error(e); // TO DO
      }
    },
    [stockDataMap, setStockDataMap]
  );

  const calcPortfolioValue = useCallback(
    async (currency: "AUD"|"USD" = "AUD") => {
      let forexRate = 0;
      if (currency in forexMap) {
        forexRate = forexMap[currency];
      } else {
        forexRate = await getForexRateAction("AUDUSD");
        setForexMap({
          "AUD": forexRate,
          "USD": 1 / forexRate // inverse to get to USDAUD rate
        });
      }

      return state.holdings.reduce(
        (acc, obj) => {
            const stock = stockDataMap[obj.stockId];
            if (!stock) return 0;
            let multiplier = stock.currency !== currency? forexRate: 1;
            return acc + multiplier * (stock.previousClose || 0) * obj.units;
        },
        0
      )
    },
    [state.holdings, stockDataMap, forexMap, setForexMap]
  );

  const updateUserAndUpdateState = useCallback(
    async (data: Partial<User>) => {
        await updateUserAction(state.id, data);
        
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
      const res = await updateProfileAction(state.id, profile);
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: res
      });
    },
    [state.id, dispatch]
  );

  const insertHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'id'|'userId'>) => {
      const res = await insertHoldingAction({
          ...holding,
          userId: state.id,
      });
      // update state
      dispatch({
          type: 'INSERT_HOLDING',
          payload: res,
      });

      return res.id;
    },
    [state.id, dispatch]
  );

  const updateHoldingAndUpdateState = useCallback(
    async (holding: Omit<Holding, 'userId'>) => {
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
      try {
        const res = await deleteHoldingAction(holdingId);
        dispatch({
          type: 'DELETE_HOLDING',
          payload: res.id
        });
      } catch (e) {
        // TO DO: sometimes user deletes a holding that is not yet in DB, which will cause error
      }
    },
    [dispatch]
  );

  const insertConversation = useCallback(
    (conversation: Pick<Conversation, 'id'|'name'|'updatedAt'>) => {
      dispatch({
          type: 'INSERT_CONVERSATION',
          payload: conversation
      });
    },
    [dispatch]
  );

  const updateConversationName = useCallback(
    (conversation: Pick<Conversation, 'id'|'name'>) => {
      dispatch({
        type: 'UPDATE_CONVERSATION_NAME',
        payload: conversation
      });
    },
    [dispatch]
  );

  const deleteConversation = useCallback(
    (conversationId: string) => {
      dispatch({
        type: 'DELETE_CONVERSATION',
        payload: conversationId,
      });
    },
    [dispatch]
  );

  return (
    <GlobalContext.Provider
      value={{
        state,
        getStockData,
        calcPortfolioValue,
        updateUserAndUpdateState,
        updateProfileAndUpdateState,
        insertHoldingAndUpdateState,
        updateHoldingAndUpdateState,
        deleteHoldingAndUpdateState,
        insertConversation,
        updateConversationName,
        deleteConversation,
        dispatch
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}