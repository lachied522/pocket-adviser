"use client";
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useReducer,
} from "react";

import { updateUserAction } from "@/actions/crud/user";
import { getForexRateAction } from "@/actions/data/forex";

import { type Action, GlobalReducer } from "./GlobalReducer";

import type { Conversation, Stock, User } from "@prisma/client";
import type { UserData } from "@/types/helpers";

type PartialStockData = Pick<Stock, 'id'|'symbol'|'previousClose'|'currency'>;

export type GlobalState = {
  state: UserData
  partialStockData: { [id: number]: PartialStockData }
  dispatch: React.Dispatch<Action>
  setPartialStockData: React.Dispatch<React.SetStateAction<{ [id: number]: PartialStockData }>>
  calcPortfolioValue: (currency?: 'AUD'|'USD') => Promise<number>
  updateUserAndUpdateState: (user: Partial<User>) => Promise<void>
  insertConversation: (conversation: Pick<Conversation, 'id'|'name'|'updatedAt'>) => void
  updateConversationName: (conversation: Pick<Conversation, 'id'|'name'>) => void
  deleteConversation: (conversationId: string) => void
  completeLesson: (title: string) => void
}

const GlobalContext = createContext<any>(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

interface GlobalProviderProps {
  children: React.ReactNode
  initialUserData: UserData
  initialStockData: { [id: number]: PartialStockData }
}

export const GlobalProvider = ({
  children,
  initialUserData,
  initialStockData,
}: GlobalProviderProps) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialUserData);
  const [partialStockData, setPartialStockData] = useState<{ [id: number]: PartialStockData }>(initialStockData);
  const [forexMap, setForexMap] = useState<{ [currency: string ]: number }>({});

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
            const stock = partialStockData[obj.stockId];
            if (!stock) return 0;
            let multiplier = stock.currency !== currency? forexRate: 1;
            return acc + multiplier * (stock.previousClose || 0) * obj.units;
        },
        0
      )
    },
    [state.holdings, partialStockData, forexMap, setForexMap]
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

  const completeLesson = useCallback(
    (title: string) => {
        dispatch({
          type: "COMPLETE_LESSON",
          payload: {
              title,
              value: "completed",
          }
        })
    },
    [dispatch]
  )

  return (
    <GlobalContext.Provider
      value={{
        state,
        partialStockData,
        setPartialStockData,
        calcPortfolioValue,
        updateUserAndUpdateState,
        insertConversation,
        updateConversationName,
        deleteConversation,
        completeLesson,
        dispatch
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}