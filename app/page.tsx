import { cookies } from "next/headers";
import Image from "next/image";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById } from "@/utils/crud/user";
import { getStockById } from "@/utils/crud/stocks";
import { getForexRate } from "@/utils/data/forex";
import { getGreeting } from "./api/chat/greeting";

import { GlobalProvider } from "@/context/GlobalContext";
import { UIProvider } from "@/context/UIContext";
import { ChatProvider } from '@/context/ChatContext';

import Container from "@/components/ui/container";
import Header from "@/components/ui/header";
import Chat from "@/components/chat/chat-container";
import Portfolio from "@/components/portfolio/portfolio";
import Footer from "@/components/ui/footer";
import TickerTape from "@/components/tape/ticker-tape";

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
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID);

    // fetch user data if able
    let userData: UserData|null = null;
    if (userId) {
        userData = await getUserById(userId.value);
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
        <UIProvider>
          <ChatProvider initialMessage={greeting}>
              <main className='min-h-screen'>
                {/* Background Image */}
                <div className='z-[-1] fixed inset-0 opacity-40 bg-slate-300'>
                      <Image
                        src='/background-image-main.jpg'
                        alt='background-image'
                        sizes='100vw'
                        fill
                        priority
                        style={{
                          objectFit: 'cover',
                        }}
                      />
                </div>
                
                <div className='bg-sky-600/80'>
                  <Header />
                  <TickerTape />
                </div>

                <div className='flex flex-col px-1 sm:px-6 py-2 sm:py-5 xl:py-10 gap-2 sm:gap-5 xl:gap-10'>
                  <Container className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                    <Chat initialUserData={userData} initialStockData={stockData} />
                  </Container>

                  <Container className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                    <Portfolio />
                  </Container>
                </div>

                <Footer />
              </main>
          </ChatProvider>
        </UIProvider>
      </GlobalProvider>
    )
}