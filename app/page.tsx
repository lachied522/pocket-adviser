import { redirect } from "next/navigation";
import { auth } from "@/auth";

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

export default async function Page({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // check if userId is in cookies
    const session = await auth();

    if (!session?.user.id) {
      // middleware should handle this
      redirect('/login');
    }
  
    // fetch user data if able
    const data = await getDataByUserId(session.user.id);

    return (
      <GlobalProvider initialUserData={data.userData} initialStockData={data.stockData}>
        <ChatProvider>
          <SidebarProvider>
            <Sidebar />
            <main className='h-screen flex flex-col overflow-hidden'>
              <div className='flex flex-row items-center overflow-hidden'>
                <SidebarOuterTrigger />
                <TickerTape />
                <SettingsMenu />
              </div>

              <NewsArea symbols={Object.values(data.stockData).map((stock) => stock.symbol)}/>

              <ChatArea />
            </main>
          </SidebarProvider>
        </ChatProvider>
      </GlobalProvider>
    )
}