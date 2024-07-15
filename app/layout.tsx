import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import { Provider as SessionProvider } from "@/context/SessionContext";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
