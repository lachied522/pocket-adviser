import "./globals.css";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { GlobalProvider } from "../context/GlobalContext";
import { Provider as SessionProvider } from "../context/SessionContext";

import { getUserById } from "@/utils/crud/user";

import { COOKIE_NAME_FOR_GUEST_USER_ID } from "@/constants/cookies";

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
  const guestCookie = cookieStore.get(COOKIE_NAME_FOR_GUEST_USER_ID);

  let data: UserData|null = null;
  if (guestCookie) {
    data = await getUserById(guestCookie.value);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <GlobalProvider initialState={data}>
            {children}
          </GlobalProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
