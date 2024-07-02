import "./globals.css";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById } from "@/utils/crud/user";
import { getStockById } from "@/utils/crud/stocks";

import { Provider as SessionProvider } from "@/context/SessionContext";
import { AIProvider } from '@/actions/ai/chat';
import { GlobalProvider } from "@/context/GlobalContext";
import { ChatProvider } from "@/context/ChatContext";
import { UIProvider } from "@/context/UIContext";

import type { Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pocket Adviser",
  description: "AI Stock Market Adviser",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // check if userId is in cookies
  const cookieStore = cookies();
  const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID);

  // fetch user data if able
  let userData: UserData|null = null;
  if (userId) {
    userData = await getUserById(userId.value);
  }

  // fetch stock data for corresponding holdings
  let stockData: { [id: number]: Stock } = {};
  if (userData) {
    await Promise.all(
        userData.holdings.map(async (holding) => {
            const data = await getStockById(holding.stockId);
            if (data) {
              stockData[data.id] = data;
            }
        })
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <GlobalProvider initialUserData={userData} initialStockData={stockData}>
            <UIProvider>
              <AIProvider>
                <ChatProvider>
                  {children}
                </ChatProvider>
              </AIProvider>
            </UIProvider>
          </GlobalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
