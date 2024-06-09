import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { getHoldings } from "@/utils/crud/holding";

import { GlobalProvider } from "./context/GlobalContext";

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
  // fetch holdings data
  const data = await getHoldings();
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider initialState={data}>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
