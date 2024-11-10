import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserDataByUserId } from "@/utils/crud/user";
import { getStockById } from "@/utils/crud/stocks";
import { getForexRate } from "@/utils/financial_modelling_prep/forex";
import { getGreeting } from "./api/chat/greeting";

import { GlobalProvider } from "@/context/GlobalContext";
import { ChatProvider } from '@/context/ChatContext';
import { SidebarProvider } from "@/components/ui/sidebar";

import TickerTape from "@/components/tape/ticker-tape";
import ChatArea from "@/components/chat/chat-area";
import NewsArea from "@/components/chat/news-area";
import SidebarOuterTrigger from "./sidebar-outer-trigger";
import SettingsMenu from "./settings-menu";
import Sidebar from "./app-sidebar";

import type { Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

async function getStockData(userData: UserData|null) {
  if (!userData) return {};
  // fetch stock data for holdings in user's portfolio
  let stockData: { [id: number]: Stock } = {};

  await Promise.all(
    userData.holdings.map(async (holding) => {
        const data = await getStockById(holding.stockId);
        if (data) {
          stockData[data.id] = data;
        }
    })
  );

  return stockData;
}

export default async function Page({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    // fetch user data if able
    let userData: UserData|null = null;
    if (userId) {
        userData = await getUserDataByUserId(userId);
    }

    // get stock data and forex rate simultaneously
    const [greeting, stockData, forexRate] = await Promise.all([
        getGreeting(userData),
        getStockData(userData),
        getForexRate("USDAUD"),
    ]);

    return (
      <GlobalProvider
        initialUserData={userData}
        initialStockData={stockData}
        initalForexRate={forexRate}
      >
        <ChatProvider initialMessage={greeting}>
          <SidebarProvider>
            <Sidebar />
            <main className='h-screen flex flex-col overflow-hidden'>

              <div className='flex flex-row items-center overflow-hidden'>
                <SidebarOuterTrigger />
                <TickerTape />
                <SettingsMenu />
              </div>

              <NewsArea symbols={[]} />

              <ChatArea />
            </main>
          </SidebarProvider>
        </ChatProvider>
      </GlobalProvider>
    )
}