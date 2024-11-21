import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getDataByUserId } from "@/utils/crud/user";

import { GlobalProvider } from "@/context/GlobalContext";
import { ChatProvider } from '@/context/ChatContext';
import { SidebarProvider } from "@/components/ui/sidebar";

import TickerTape from "@/components/tape/ticker-tape";
import ChatArea from "@/components/chat/chat-area";
import NewsArea from "@/components/chat/news-area";
import Sidebar from "@/components/sidebar/app-sidebar";
import SidebarOuterTrigger from "@/components/sidebar/sidebar-outer-trigger";
import SettingsMenu from "@/components/settings/settings-menu";
import WelcomeDialog from "@/components/dialogs/welcome-dialog";

export default async function Page({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
      // middleware should handle this
      redirect('/login');
    }
  
    // fetch user data if able
    const data = await getDataByUserId(userId);

    return (
      <GlobalProvider initialUserData={data.userData} initialStockData={data.stockData}>
        <ChatProvider>
          <SidebarProvider>
            <Sidebar />
            <main className='h-dvh flex flex-col overflow-hidden'>
              <div className='flex flex-row items-center overflow-hidden'>
                <SidebarOuterTrigger />
                <TickerTape />
                <SettingsMenu />
              </div>

              <NewsArea symbols={Object.values(data.stockData).map((stock) => stock.symbol)}/>

              <ChatArea />
            </main>

            {searchParams?.welcome === "true" && <WelcomeDialog initialIsOpen={true} />}
          </SidebarProvider>
        </ChatProvider>
      </GlobalProvider>
    )
}