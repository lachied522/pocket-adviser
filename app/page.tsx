import { cookies } from "next/headers";
import Image from "next/image";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById } from "@/utils/crud/user";
import { getStockById } from "@/utils/crud/stocks";
import { getForexRate } from "@/utils/data/forex";

import { GlobalProvider } from "@/context/GlobalContext";
import { UIProvider } from "@/context/UIContext";
import { AIProvider } from "@/context/AIContext";

import Container from "@/components/ui/container";
import Header from "@/components/ui/header";
import ProfileTabs from "@/components/profile/profile-tabs";
import Chat from "@/components/adviser/chat";
import Portfolio from "@/components/portfolio/portfolio";
import Footer from "@/components/ui/footer";
import StockTape from "@/components/tape/stock-tape";

import type { Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
    const [stockData, forexRate] = await Promise.all([
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
          <AIProvider
            userId={userData?.id}
            adviceId={searchParams? parseInt(searchParams.adviceId as string): undefined}
          >
              <main className='min-h-screen'>
                {/* Background Image */}
                <div className='z-[-1] fixed inset-0 opacity-40 bg-slate-300'>
                      <Image
                        src='/background-image-main.jpg'
                        alt='background-image'
                        fill
                        style={{
                          objectFit: 'cover',
                        }}
                      />
                </div>
                
                <div className='bg-sky-600/80'>
                  <Header />
                  <StockTape />
                </div>

                <div className='bg-slate-50/80 px-6 shadow-sm'>
                  <Container className='p-3.5'>
                    <ProfileTabs />
                  </Container>
                </div>

                <div className='flex flex-col gap-5 xl:gap-10 py-5 xl:py-10'>
                  <div className='px-3 sm:px-6'>
                    <Container className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                      <Chat initialUserData={userData} initialStockData={stockData} />
                    </Container>
                  </div>

                  <div className='px-3 sm:px-6'>
                    <Container className='flex flex-col gap-6 p-7 bg-white border border-slate-200 rounded-xl'>
                      <Portfolio />
                    </Container>
                  </div>
                </div>

                <Footer />
              </main>
          </AIProvider>
        </UIProvider>
      </GlobalProvider>
    )
}