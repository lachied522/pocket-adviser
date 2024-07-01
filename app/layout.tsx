import "./globals.css";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { COOKIE_NAME_FOR_USER_ID, COOKIE_NAME_FOR_IS_GUEST } from "@/constants/cookies";

import { getUserById } from "@/utils/crud/user";

import { Provider as SessionProvider } from "@/context/SessionContext";
import { AIProvider } from '@/actions/ai/chat';
import { GlobalProvider } from "@/context/GlobalContext";
import { AdviserProvider } from "@/context/AdviserContext";

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
  const cookieStore = cookies();
  const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID);

  let data: UserData|null = null;
  if (userId) {
    data = await getUserById(userId.value);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <GlobalProvider initialState={data}>
            <AIProvider>
              <AdviserProvider>
                {children}
              </AdviserProvider>
            </AIProvider>
          </GlobalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
